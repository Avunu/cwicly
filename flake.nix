{
  description = "Cwicly (maintenance fork) — a Gutenberg design toolkit plugin, released as a self-updating GitHub-release zip";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    composition-c4.url = "github:fossar/composition-c4";
    # The fork bundles gutenberg-downgrade as a composer path dependency; the
    # flake pins the same repo so Nix builds stay pure and CI can fetch it.
    gutenberg-downgrade.url = "github:Avunu/gutenberg-downgrade";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      composition-c4,
      git-hooks,
      gutenberg-downgrade,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ composition-c4.overlays.default ];
        };
        inherit (pkgs) lib stdenvNoCC;

        mkPhp =
          base:
          base.buildEnv {
            extensions =
              { enabled, all }:
              enabled
              ++ (with all; [
                curl
                mbstring
                openssl
                tokenizer
                fileinfo
              ]);
            # PHPStan parses the full WordPress stubs; the 128M default is not enough.
            extraConfig = ''
              memory_limit = 2G
              error_reporting = E_ALL
            '';
          };

        # The toolchain runs on the newest supported PHP; php83 exists only to
        # prove the plugin still runs on the declared floor (Requires PHP).
        php = mkPhp pkgs.php84;
        php83 = mkPhp pkgs.php83;

        nodejs = pkgs.nodejs_22;

        # ------------------------------------------------------------------ #
        # Plugin metadata, read once and shared by packages/checks.           #
        # composer.json owns the version (Release Please bumps it); the       #
        # plugin header owns the WordPress compatibility range.               #
        # ------------------------------------------------------------------ #
        composerData = builtins.fromJSON (builtins.readFile ./composer.json);
        inherit (composerData) version;

        pname = "cwicly";
        mainFile = "cwicly.php";
        src = self;

        # Read a plugin-header field from the main file.
        pluginHeader =
          field:
          let
            lines = lib.splitString "\n" (builtins.readFile (./. + "/${mainFile}"));
            pattern = "[[:space:]]*\\*[[:space:]]*${field}:[[:space:]]*([^[:space:]]+)[[:space:]]*";
            hit = lib.findFirst (l: builtins.match pattern l != null) null lines;
          in
          if hit == null then
            throw "${mainFile} is missing the plugin header line ' * ${field}: <value>'"
          else
            builtins.head (builtins.match pattern hit);

        requireMajorMinor =
          field: value:
          if builtins.match "[0-9]+\\.[0-9]+" value == null then
            throw "${mainFile} '${field}: ${value}' must be bare major.minor (e.g. 6.1)"
          else
            value;

        wpTested = requireMajorMinor "Tested up to" (pluginHeader "Tested up to");
        wpRequires = requireMajorMinor "Requires at least" (pluginHeader "Requires at least");

        # ------------------------------------------------------------------ #
        # PHP / Composer vendor dependencies.                                 #
        # c4.fetchComposerDeps reads composer.lock per-package — no hash.     #
        # It fetches packages-dev too (the PHPStan WordPress stubs), which the #
        # checks rely on; `composer install --no-dev` keeps them out of the    #
        # zip. avunu/gutenberg-downgrade is a path repository with no git      #
        # source, so it is filtered out of the lock handed to c4 and injected  #
        # as a path dist at build time instead (see injectGdPathRepo).         #
        # phpstan/phpdoc-parser is pinned in tests/tools/composer.json: c4     #
        # can only git-fetch packages that appear in some lock, and the phar-  #
        # only phpstan/phpstan itself comes from nixpkgs.                      #
        # ------------------------------------------------------------------ #
        gdPkgName = "avunu/gutenberg-downgrade";

        # The GD entry exactly as committed: version + autoload metadata, minus
        # its path dist/source (which have no place in the store-built tree).
        gdEntry =
          let
            lock = builtins.fromJSON (builtins.readFile ./composer.lock);
            hit = lib.findFirst (p: p.name == gdPkgName) null lock.packages;
          in
          if hit == null then
            throw "composer.lock has no ${gdPkgName} entry"
          else
            builtins.removeAttrs hit [ "source" "dist" ];

        # The lock with the GD entry removed, computed at evaluation time (pure:
        # c4's own fetch-deps.nix uses lib.importJSON the same way). Passed to
        # the build as a plain string so no .drv path needs realising first; the
        # build writes it to composer.lock and re-adds GD via injectGdPathRepo.
        #
        # Two variants: `withDev` keeps packages-dev (the PHPStan stubs the
        # checks need); the no-dev variant is what pluginPackage installs. A
        # --no-dev install still *validates* the whole lock graph before
        # pruning, so the full lock's szepeviktor -> phpstan/phpstan edge (a
        # phar-only package absent from the c4 repo) breaks it; the no-dev
        # variant drops packages-dev entirely and resolves cleanly.
        mkLockForC4 =
          withDev:
          let
            lock = builtins.fromJSON (builtins.readFile ./composer.lock);
            withoutGd = key: builtins.filter (p: p.name != gdPkgName) (lock.${key} or [ ]);
          in
          builtins.toJSON (lock // {
            packages = withoutGd "packages";
            packages-dev = if withDev then withoutGd "packages-dev" else [ ];
          });

        lockForC4Json = mkLockForC4 true;
        lockNoDevForC4Json = mkLockForC4 false;

        # c4 is fed the GD-free lock through its `src` argument: fetchComposerDeps
        # reads "${src}/composer.lock" with builtins.readFile. src must be a path,
        # so these tiny runCommand directories are the only things realised — and
        # only when composerDeps is actually demanded by a build/check.
        lockForC4Dir = pkgs.runCommand "cwicly-composer-lock-for-c4-dir" { } ''
          mkdir "$out"
          printf '%s' ${lib.escapeShellArg lockForC4Json} > "$out/composer.lock"
        '';

        lockNoDevForC4Dir = pkgs.runCommand "cwicly-composer-lock-nodev-for-c4-dir" { } ''
          mkdir "$out"
          printf '%s' ${lib.escapeShellArg lockNoDevForC4Json} > "$out/composer.lock"
        '';

        composerDeps = pkgs.c4.fetchComposerDeps { src = lockForC4Dir; };
        composerDepsNoDev = pkgs.c4.fetchComposerDeps { src = lockNoDevForC4Dir; };

        # The gutenberg-downgrade source tree, cleaned for copying into vendor/.
        # This is the flake input (a pinned git checkout), so Nix builds and CI
        # are pure. The composer path repository in composer.json points at the
        # sibling checkout for local development; the lock records it as a path
        # install, which injectGdPathRepo rewrites to this store copy at build
        # time.
        gdSource = builtins.path {
          name = "gutenberg-downgrade-src";
          path = gutenberg-downgrade;
          filter =
            path: _type:
            let
              base = baseNameOf (toString path);
            in
            !(lib.elem base [
              ".git"
              ".direnv"
              ".envrc"
              "node_modules"
              "vendor"
              "result"
              "debug"
              ".phpunit.cache"
            ]);
        };

        # The root composer.json declares ../gutenberg-downgrade as a path
        # repository, but the sibling checkout does not exist in the sandbox.
        # Deleting the key would change composer.json's content-hash and force a
        # full re-resolution (which cannot find GD anywhere). Instead REPOINT it
        # at the store copy staged by injectGdPathRepo: the repository stays
        # declared, resolves against a real directory containing GD's
        # composer.json, and `composer update --lock` only refreshes the hash
        # without touching the package graph.
        repointGdRepo = ''
          php -r '
            $json = json_decode(file_get_contents("composer.json"), true, 512, JSON_THROW_ON_ERROR);
            foreach ($json["repositories"] as &$repo) {
              if (($repo["type"] ?? "") === "path" && ($repo["url"] ?? "") === "../gutenberg-downgrade") {
                $repo["url"] = getcwd() . "/vendor-src/${gdPkgName}";
              }
            }
            unset($repo);
            file_put_contents("composer.json", json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
          '
        '';

        # Before installing, start from a GD-free lock and re-add the GD entry
        # with a path dist pointing at the store copy. Runs in patchPhase, so
        # the c4 hook's later `composer update --lock` sees the final package
        # set; it verifies only the root package's composer.json against the
        # lock's content-hash and rewrites package entries verbatim, so the
        # injected path dist survives untouched.
        #
        # $lockJson is the GD-free lock for this derivation (full or no-dev).
        # In the full variant, the dev-only szepeviktor/phpstan-wordpress
        # package requires phpstan/phpstan, which is phar-only on Packagist and
        # therefore absent from the c4 repo (and replaced by GD at runtime).
        # Drop that one key from its lock entry: composer install honours the
        # lock as-is, and the analysers that need phpstan get the nixpkgs
        # binary instead.
        injectGdPathRepo = lockJson: ''
          printf '%s' ${lib.escapeShellArg lockJson} > composer.lock
          printf '%s' ${lib.escapeShellArg (builtins.toJSON gdEntry)} > gd-entry.json
          mkdir -p vendor-src/${gdPkgName}
          cp -r ${gdSource}/. vendor-src/${gdPkgName}/
          chmod -R u+w vendor-src
          php -r '
            $lock = json_decode(file_get_contents("composer.lock"), true, 512, JSON_THROW_ON_ERROR);
            foreach ($lock["packages-dev"] as &$pkg) {
              if ($pkg["name"] === "szepeviktor/phpstan-wordpress") {
                unset($pkg["require"]["phpstan/phpstan"]);
              }
            }
            unset($pkg);
            $entry = json_decode(file_get_contents("gd-entry.json"), true, 512, JSON_THROW_ON_ERROR);
            $entry["dist"] = ["type" => "path", "url" => getcwd() . "/vendor-src/${gdPkgName}", "reference" => null];
            $lock["packages"][] = $entry;
            file_put_contents("composer.lock", json_encode($lock, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
          '
          rm -f gd-entry.json
        '';

        # The test runners (PHPUnit, Brain Monkey) live in their own Composer
        # project so they are never fetched for `nix build .#zip`.
        testTools = stdenvNoCC.mkDerivation {
          pname = "${pname}-test-tools";
          inherit version;
          src = ./tests/tools;

          composerDeps = pkgs.c4.fetchComposerDeps {
            lockFile = ./tests/tools/composer.lock;
          };

          nativeBuildInputs = [
            php
            php.packages.composer
            pkgs.c4.composerSetupHook
          ];

          buildPhase = ''
            runHook preBuild
            composer --no-ansi install --no-interaction
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p "$out"
            # -L: c4 installs vendor as symlinks into the store.
            cp -rL vendor "$out/"
            runHook postInstall
          '';
        };

        # ------------------------------------------------------------------ #
        # Final plugin assembly: PHP + composer runtime deps + committed JS.   #
        # ------------------------------------------------------------------ #
        pluginPackage = stdenvNoCC.mkDerivation {
          inherit
            pname
            version
            src
            ;

          # The runtime-only dependency set: a --no-dev install still validates
          # the whole lock graph, so it gets the dev-free lock (see mkLockForC4).
          composerDeps = composerDepsNoDev;

          nativeBuildInputs = [
            php
            php.packages.composer
            pkgs.c4.composerSetupHook
          ];

          patchPhase = ''
            runHook prePatch
            ${injectGdPathRepo lockNoDevForC4Json}
            ${repointGdRepo}
            runHook postPatch
          '';

          buildPhase = ''
            runHook preBuild
            composer --no-ansi install --no-dev --no-interaction --optimize-autoloader
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            pluginDir="$out/share/wordpress/plugins/${pname}"
            mkdir -p "$pluginDir"

            cp ${mainFile} README.md LICENSE readme.txt screenshot.jpg wpml-config.xml "$pluginDir/"
            # -L dereferences: composition-c4 installs vendor/ as symlinks into the
            # Nix store; the distributable plugin must contain real, self-contained files.
            cp -rL assets build core vendor "$pluginDir/"
            chmod -R u+w "$pluginDir"
            # The path-repo copy is a plain directory, not a store symlink — fine.
            test -f "$pluginDir/vendor/avunu/gutenberg-downgrade/gutenberg-downgrade.php" \
              || { echo "gutenberg-downgrade missing from vendor/" >&2; exit 1; }

            # A `sed` that matches nothing still exits 0, so guard every stamp.
            grep -qE "^[[:space:]]*\* Version:" "$pluginDir/${mainFile}" \
              || { echo "${mainFile} is missing the 'Version:' plugin header line" >&2; exit 1; }
            grep -qE "define\(\s*'CWICLY_VERSION'," "$pluginDir/${mainFile}" \
              || { echo "${mainFile} is missing the CWICLY_VERSION define" >&2; exit 1; }
            grep -qE "^Stable tag:" "$pluginDir/readme.txt" \
              || { echo "readme.txt is missing the Stable tag line" >&2; exit 1; }

            # composer.json is the single source of truth for the version (Release
            # Please bumps it); WordPress and the update checker read the header.
            sed -i -E "s|^([[:space:]]*\* Version:[[:space:]]*).*|\1${version}|" "$pluginDir/${mainFile}"
            sed -i -E "s|(define\( *'CWICLY_VERSION', *')[^']*|\1${version}|" "$pluginDir/${mainFile}"
            sed -i -E "s|^(Stable tag:).*|\1 ${version}|" "$pluginDir/readme.txt"

            runHook postInstall
          '';

          meta = {
            inherit (composerData) description;
            license = lib.licenses.gpl2Plus;
            platforms = lib.platforms.all;
          };
        };

        pluginDir = "${pluginPackage}/share/wordpress/plugins/${pname}";

        # vendor/ with the dev packages (WordPress stubs, phpstan-wordpress) for
        # the static-analysis checks; the plugin package itself is --no-dev.
        devVendor = stdenvNoCC.mkDerivation {
          pname = "${pname}-dev-vendor";
          inherit version src composerDeps;

          nativeBuildInputs = [
            php
            php.packages.composer
            pkgs.c4.composerSetupHook
          ];

          # See pluginPackage: the GD store copy is staged and the lock
          # finalised, then the path repository is repointed at it — all in
          # patchPhase, before the c4 hook configures repos in configurePhase.
          patchPhase = ''
            runHook prePatch
            ${injectGdPathRepo lockForC4Json}
            ${repointGdRepo}
            runHook postPatch
          '';

          buildPhase = ''
            runHook preBuild
            composer --no-ansi install --no-interaction
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p "$out"
            cp -rL vendor "$out/"
            # The GD path copy is not a store symlink; keep it real and deref'd.
            chmod -R u+w "$out/vendor/${gdPkgName}" 2>/dev/null || true
            runHook postInstall
          '';
        };

        # ------------------------------------------------------------------ #
        # git-hooks.nix: the same gates as CI, before every commit.           #
        # Run by prek (a pre-commit reimplementation: no Python, fast).       #
        # Not wired into `checks`: the JS hooks shell out to node_modules,    #
        # which is gitignored; checks.* below cover PHP hermetically.         #
        # ------------------------------------------------------------------ #
        pre-commit-check = git-hooks.lib.${system}.run {
          src = self;
          package = pkgs.prek;
          hooks = {
            phpstan = {
              enable = true;
              package = pkgs.phpstan;
              entry = "${pkgs.phpstan}/bin/phpstan analyse --memory-limit=2G";
              pass_filenames = false;
            };
            nixfmt.enable = true;
            statix.enable = true;
            deadnix.enable = true;
          };
        };

        # Working tree for the checks: source + vendor + test tools.
        # vendor/ is copied in rather than pointed at in the store: composer's
        # optimised classmap resolves relative to dirname(vendor), so a store
        # vendor would analyse two copies.
        checkWorkTree = vendor: ''
          cp -r "$src" ./work
          chmod -R u+w ./work
          cd ./work
          cp -rL ${vendor}/vendor ./vendor
          chmod -R u+w ./vendor
          # composition-c4 installs every package from a path repository into
          # the store, and installed.json records them as `"dist": {"type":
          # "path"}`. PHPStan >= 2.2.13 reads a path package as project code
          # edited in place and tracks its files one by one instead of by
          # package (phpstan-src#6356); after the analysis its main process then
          # parses and reflects each of those files to record their exported
          # nodes for the result cache — the 6 MB WordPress stubs included, at
          # over 2 GB, past the memory limit. The copy above is a plain install,
          # not a path one, so drop the claim.
          php -r '
            $file = "vendor/composer/installed.json";
            $installed = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
            foreach ($installed["packages"] as &$package) {
              if (($package["dist"]["type"] ?? null) === "path") {
                unset($package["dist"]);
              }
            }
            file_put_contents($file, json_encode($installed, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
          '
          ln -s ${testTools}/vendor tests/tools/vendor
          export HOME="$TMPDIR"
        '';

        # The PHPUnit suite under a given PHP build.
        unitCheck =
          name: phpPkg:
          pkgs.runCommand name
            {
              nativeBuildInputs = [ phpPkg ];
              inherit src;
            }
            ''
              set -euo pipefail
              ${checkWorkTree pluginDir}
              # Through the interpreter: vendor/bin/phpunit's shebang needs
              # /usr/bin/env, which the sandbox does not have.
              php tests/tools/vendor/bin/phpunit -c tests/phpunit-unit.xml --do-not-cache-result
              touch "$out"
            '';
      in
      {
        devShells.default = pkgs.mkShell {
          packages = pre-commit-check.enabledPackages ++ [
            php
            php.packages.composer
            pkgs.phpstan
            nodejs
          ];

          shellHook = ''
            ${pre-commit-check.shellHook}
            echo "PHP $(php --version | head -1)"
            echo "Node $(node --version)"
            echo "Browser tests use CHROME_PATH (default: google-chrome-stable / chromium on PATH)."
          '';
        };

        packages = {
          default = pluginPackage;

          # Deterministic, ready-to-install zip (top-level cwicly/).
          # nix build .#zip -> result/cwicly.zip
          zip = stdenvNoCC.mkDerivation {
            name = "${pname}-zip-${version}";
            nativeBuildInputs = [ pkgs.zip ];
            buildCommand = ''
              mkdir -p tmp/${pname}
              cp -r ${pluginDir}/. tmp/${pname}/
              chmod -R u+w tmp
              mkdir -p "$out"
              (cd tmp && zip -q -r -X "$out/${pname}.zip" ${pname})
            '';
          };
        };

        checks = {
          # The committed header must already be right: plugin-update-checker
          # reads the main file from the git tag, not from the built zip.
          plugin-header = pkgs.runCommand "check-plugin-header" { inherit src; } ''
            set -euo pipefail
            get() {
              sed -n -E "s|^[[:space:]]*\* $1:[[:space:]]*([^[:space:]]+)[[:space:]]*$|\1|p" "$src/${mainFile}"
            }
            fail=0
            check() {
              if [ "$2" != "$3" ]; then
                echo "${mainFile} '$1: $2' does not match $4 ($3)" >&2
                fail=1
              fi
            }
            check 'Version' "$(get 'Version')" '${version}' 'composer.json version'
            [ "$fail" -eq 0 ] || exit 1
            # CWICLY_VERSION and readme.txt must agree with composer.json too.
            grep -qF "define( 'CWICLY_VERSION', '${version}' )" "$src/${mainFile}" \
              || { echo "${mainFile} CWICLY_VERSION does not match composer.json (${version})" >&2; exit 1; }
            grep -qE "^Stable tag:[[:space:]]*${version}[[:space:]]*$" "$src/readme.txt" \
              || { echo "readme.txt Stable tag does not match composer.json (${version})" >&2; exit 1; }
            echo "${mainFile} header is consistent (version ${version}, tested up to ${wpTested})"
            touch "$out"
          '';

          phpstan =
            pkgs.runCommand "check-phpstan"
              {
                nativeBuildInputs = [
                  php
                  (pkgs.phpstan.override { inherit php; })
                ];
                inherit src;
              }
            ''
              set -euo pipefail
              ${checkWorkTree devVendor}
              phpstan analyse --no-progress --no-ansi --memory-limit=2G
              touch "$out"
            '';

          unit = unitCheck "check-unit" php;
          # The same suite on the declared floor (Requires PHP: 8.3).
          unit-php83 = unitCheck "check-unit-php83" php83;
        };
      }
    );
}
