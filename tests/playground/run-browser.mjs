// Test 2 — headless Chrome against the booted WordPress. This is the only test
// that loads the committed bundles as a browser would: the Cwicly admin pages
// must mount their React apps, and a front-end page containing a cwicly/div
// block must render with its styles and window.CCers config — all without JS
// errors or PHP output leaking into the page. These are exactly the silent
// failure modes (blank admin screens, unstyled blocks) static checks miss.
import { chromium } from "playwright-core";
import { bootPlayground, chromePath, phpJson, PLUGIN_SLUG, PHP_VERSION, WP_VERSION } from "./lib.mjs";
import { tally } from "./assert.mjs";

const t = tally();
console.log(`Test 2 — browser smoke (WordPress ${WP_VERSION}, PHP ${PHP_VERSION})\n`);

const PHP_ERROR = /<b>(Notice|Deprecated|Warning|Fatal error|Parse error)<\/b>:/;

function watch(page) {
	const w = {
		pageErrors: [],
		consoleErrors: [],
		failedAssets: [],
		reset() {
			w.pageErrors.length = 0;
			w.consoleErrors.length = 0;
			w.failedAssets.length = 0;
		},
	};
	page.on("pageerror", (e) => {
		const detail = e.stack ? String(e.stack).split("\n").slice(0, 3).join(" <- ") : `${e.name}: ${e.message}`;
		w.pageErrors.push(detail.slice(0, 400));
	});
	page.on("console", (m) => {
		if (m.type() !== "error") return;
		const text = m.text();
		// Chrome reports every 4xx resource as a console error; only our own
		// assets matter (favicons and the like are noise in a fresh install).
		if (/Failed to load resource/.test(text) && !m.location().url.includes(PLUGIN_SLUG)) return;
		w.consoleErrors.push(`${text.slice(0, 200)} @ ${m.location()?.url ?? "?"}`.slice(0, 400));
	});
	page.on("response", (r) => {
		if (r.status() >= 400) {
			w.failedAssets.push(`${r.status()} ${r.url()}`);
		}
	});
	return w;
}

async function login(page, url) {
	await page.goto(`${url}/wp-login.php`, { waitUntil: "networkidle" });
	if (page.url().includes("wp-login.php")) {
		await page.fill("#user_login", "admin");
		await page.fill("#user_pass", "password");
		await page.click("#wp-submit");
		await page.waitForLoadState("networkidle");
	}
}

/** Load a page and assert it is clean: no JS errors, no PHP errors printed, no failed plugin assets. */
async function visitClean(page, w, url, label) {
	w.reset();
	await page.goto(url, { waitUntil: "load", timeout: 90_000 });
	await page.waitForTimeout(1500);
	const html = await page.content();
	t.check(`${label}: no uncaught page errors`, w.pageErrors.length === 0, w.pageErrors.slice(0, 3).join(" | "));
	t.check(`${label}: no console errors`, w.consoleErrors.length === 0, w.consoleErrors.slice(0, 3).join(" | "));
	t.check(`${label}: no failed plugin assets`, w.failedAssets.length === 0, w.failedAssets.slice(0, 3).join(" | "));
	t.check(`${label}: no PHP errors in the page`, !PHP_ERROR.test(html), PHP_ERROR.exec(html)?.[0] ?? "");
	return html;
}

let server;
let browser;
try {
	server = await bootPlayground({ port: 9430 });
	const base = server.serverUrl;

	// Seed a published front page built from a cwicly/div block, so the
	// front-end pass exercises the real render callback + asset pipeline.
	await phpJson(
		server,
		`
			$block = '<!-- wp:cwicly/div {"classes":{"an":["cc-smoke-test"]}} --><div class="cc-smoke-test">SMOKECONTENT</div><!-- /wp:cwicly/div -->';
			$id = wp_insert_post([
				'post_title' => 'Cwicly Smoke',
				'post_content' => $block,
				'post_status' => 'publish',
				'post_type' => 'page',
			]);
			if (!is_wp_error($id)) { update_option('show_on_front', 'page'); update_option('page_on_front', (string) $id); }
			return is_wp_error($id) ? String($id->get_error_message()) : (int) $id;
		`,
	);

	browser = await chromium.launch({ executablePath: chromePath(), headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	const w = watch(page);

	await login(page, base);

	// 1. The Themer screen mounts its React app.
	{
		const html = await visitClean(page, w, `${base}/wp-admin/admin.php?page=cwicly`, "themer page");
		const mounted = await page.evaluate(() => document.querySelector("#cc-themer-page")?.children.length > 0);
		t.check("themer: #cc-themer-page has mounted children", mounted === true, html.length ? "" : "empty page");
	}

	// 2. Settings and welcome screens mount.
	await visitClean(page, w, `${base}/wp-admin/admin.php?page=cwicly-settings`, "settings page");
	{
		const mounted = await page.evaluate(() => document.querySelector("#cc-settings-page")?.children.length > 0);
		t.check("settings: #cc-settings-page has mounted children", mounted === true);
	}
	await visitClean(page, w, `${base}/wp-admin/admin.php?page=cwicly-welcome`, "welcome page");
	{
		const mounted = await page.evaluate(() => document.querySelector("#cc-welcome-page")?.children.length > 0);
		t.check("welcome: #cc-welcome-page has mounted children", mounted === true);
	}

	// 3. Front end: the block renders, CC styles load, window.CCers exists.
	{
		await visitClean(page, w, `${base}/`, "front page");
		const html = await page.content();
		t.check("front page contains the rendered cwicly/div content", html.includes("SMOKECONTENT"));
		t.check("front page links the CC stylesheet", /href="[^"]*build\/style-index\.css/.test(html));
		const ccers = await page.evaluate(() => typeof window.CCers === "object" && window.CCers !== null && "restBase" in window.CCers);
		t.check("window.CCers inline config present on the front end", ccers === true);
	}

	// 4. Post editor: the classic screen where cwicly_editor_blocks enqueues.
	//    Only asserts cleanliness (no mount assertion): the fork's known issue
	//    with the paragraph toolbar lives inside the editor, not around it.
	{
		await visitClean(page, w, `${base}/wp-admin/post-new.php`, "post editor");
	}
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	process.exitCode = 1;
} finally {
	if (browser) await browser.close();
	if (server) await server[Symbol.asyncDispose]();
}

process.exitCode ||= t.failures ? 1 : 0;
if (t.failures) console.log(`\n${t.failures} failure(s)`);
else console.log("\nAll browser checks passed.");
