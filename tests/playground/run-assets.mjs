// Test 0 — build-output assertions (no server). The fork ships committed JS
// artifacts with no source in-tree, so the cheapest tier of defense is proving
// the artifacts are complete and self-consistent: every webpack chunk that
// build/index.js loads exists on disk, and each admin React app's bundle and
// stylesheet are present. A missing chunk is a silent broken editor at runtime.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tally } from "./assert.mjs";

const t = tally();
console.log("Test 0 — build assets\n");

// No lib.mjs import here: this tier runs without the playground deps
// installed. The plugin dir defaults to the working tree; point
// CWICLY_PLUGIN_DIR at the nix-built plugin to test the release contents.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dir = process.env.CWICLY_PLUGIN_DIR ?? REPO_ROOT;
const read = (rel) => readFileSync(resolve(dir, rel), "utf8");

// 1. Editor block bundle + its chunks.
const indexJs = read("build/index.js");
t.check("build/index.js parses as one large minified file", indexJs.length > 100_000);

// The bundle spawns SCSS/code workers via `new URL(n.p + n.u(<id>), n.b)` where
// u(id) = id + ".js". Collect those chunk ids and assert each file exists next
// to index.js — a missing worker chunk is a silent broken code editor.
const chunkIds = new Set();
for (const m of indexJs.matchAll(/\.u\((\d+)\)/g)) chunkIds.add(m[1]);
const missingChunks = [...chunkIds].filter((id) => !existsSync(resolve(dir, "build", `${id}.js`)));
t.check(
	`every chunk referenced by build/index.js exists (${chunkIds.size} found)`,
	chunkIds.size > 0 && missingChunks.length === 0,
	missingChunks.join(", "),
);
t.check("build/index.css exists", existsSync(resolve(dir, "build", "index.css")));
t.check("build/style-index.css exists (front-end CC style)", existsSync(resolve(dir, "build", "style-index.css")));

// 2. The four wp-admin React apps.
for (const app of ["admin", "themer", "role-editor", "welcome"]) {
	const base = `core/includes/js/${app}/build`;
	t.check(`${base}/index.js exists`, existsSync(resolve(dir, base, "index.js")));
	t.check(
		`${base} has a stylesheet`,
		existsSync(resolve(dir, base, "style-index.css")) || existsSync(resolve(dir, base, "index.css")),
	);
}

// 3. Runtime front-end scripts enqueued by class-frontend.php must exist.
for (const f of [
	"assets/js/ccers.min.js",
	"assets/js/floating-core.min.js",
	"assets/js/floating-dom.min.js",
	"assets/css/base.css",
]) {
	t.check(`${f} exists`, existsSync(resolve(dir, f)));
}

// 4. Version consistency across the three declarations (composer.json owns it;
// release-please stamps the header and CWICLY_VERSION; readme.txt is stamped by
// the Nix build, so only check the two release-please-owned places here).
const composerVersion = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "..", "composer.json"), "utf8")).version;
const entry = read("cwicly.php");
const headerMatch = /\* Version:\s+(\S+)/.exec(entry);
const constMatch = /define\(\s*'CWICLY_VERSION',\s*'([^']+)'\s*\)/.exec(entry);
t.check(`plugin header Version matches composer.json (${composerVersion})`, headerMatch?.[1] === composerVersion, headerMatch?.[1]);
t.check(`CWICLY_VERSION matches composer.json`, constMatch?.[1] === composerVersion, constMatch?.[1]);

process.exit(t.failures ? 1 : 0);
