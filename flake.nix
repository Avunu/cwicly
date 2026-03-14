{
  description = "Cwicly WordPress plugin";

  inputs = {
    nixpkgs.url        = "github:NixOS/nixpkgs/nixos-unstable";
    composition-c4.url = "github:fossar/composition-c4";
  };

  outputs = { self, nixpkgs, composition-c4 }:
    let
      systems      = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      pkgsFor = system: import nixpkgs {
        inherit system;
        overlays = [ composition-c4.overlays.default ];
      };
    in
    {
      devShells = forAllSystems (system:
        let pkgs = pkgsFor system; in
        {
          # ---------------------------------------------------------------- #
          # Development shell: php, composer, npm                            #
          # ---------------------------------------------------------------- #
          default = pkgs.mkShell {
            packages = [
              pkgs.php83
              pkgs.php83.packages.composer
              pkgs.nodejs_20
            ];
          };
        }
      );

      packages = forAllSystems (system:
        let
          pkgs    = pkgsFor system;
          php     = pkgs.php83;
          inherit (pkgs) lib stdenvNoCC buildNpmPackage importNpmLock;

          pname   = "cwicly";
          version = "1.0.0";
          src     = self;

          # -------------------------------------------------------------- #
          # PHP / Composer vendor dependencies                               #
          # c4.fetchComposerDeps reads composer.lock per-package via        #
          # builtins.fetchGit — no hash needed.                             #
          # -------------------------------------------------------------- #
          composerDeps = pkgs.c4.fetchComposerDeps {
            inherit src;
          };

          # -------------------------------------------------------------- #
          # JS assets: wp-scripts build                                     #
          # importNpmLock reads integrity hashes from package-lock.json     #
          # directly — no npmDepsHash needed.                               #
          # -------------------------------------------------------------- #
          builtAssets = buildNpmPackage {
            inherit pname version src;

            npmDeps        = importNpmLock { npmRoot = src; };
            npmConfigHook  = importNpmLock.npmConfigHook;
            npmBuildScript = "build";

            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -r build/. $out/
              runHook postInstall
            '';
          };

        in
        {
          # ---------------------------------------------------------------- #
          # Final plugin assembly                                            #
          # ---------------------------------------------------------------- #
          default = stdenvNoCC.mkDerivation {
            inherit pname version src composerDeps;

            nativeBuildInputs = [
              php
              php.packages.composer
              pkgs.c4.composerSetupHook
            ];

            buildPhase = ''
              runHook preBuild
              composer --no-ansi install --no-dev --no-interaction --optimize-autoloader
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall

              pluginDir="$out/share/wordpress/plugins/cwicly"
              mkdir -p "$pluginDir"

              cp cwicly.php readme.txt wpml-config.xml "$pluginDir/"
              cp -r assets core vendor "$pluginDir/"

              # Compiled JS/CSS from wp-scripts build.
              mkdir -p "$pluginDir/build"
              cp -r ${builtAssets}/. "$pluginDir/build/"

              runHook postInstall
            '';

            meta = {
              description = "Maintenance build of the Cwicly WordPress plugin";
              license     = lib.licenses.isc;
              platforms   = lib.platforms.all;
            };
          };
        }
      );
    };
}
