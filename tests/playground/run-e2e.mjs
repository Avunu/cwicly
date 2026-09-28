// Test 1 — PHP-level assertions inside a booted WordPress (no browser).
//
// Each block simulates a request context (an admin screen, the front end, a
// REST request) by defining the constants WordPress reads before wp-load, then
// inspects what the plugin registered: options written by the version check,
// script/style handles, the cwicly/div block, and the REST routes. The fork's
// failure modes are mostly silent (a hook that fatals kills the whole page), so
// every step also asserts zero PHP notices/deprecations from legacy code.
import { bootPlayground, phpJson, PLUGIN_SLUG, PHP_VERSION, WP_VERSION } from "./lib.mjs";
import { deprecations, noticeDetail, tally } from "./assert.mjs";

const t = tally();
console.log(`Test 1 — PHP-level (WordPress ${WP_VERSION}, PHP ${PHP_VERSION})\n`);

let server;
try {
	server = await bootPlayground({ port: 9420 });

	// 1. Activation / plugins_loaded bookkeeping.
	{
		const { value, notices } = await phpJson(
			server,
			`
				return [
					'db_version' => get_option('cwicly_db_version'),
					'deprecated' => get_option('cwicly_deprecated'),
					'active' => in_array('${PLUGIN_SLUG}/${PLUGIN_SLUG}.php', (array) get_option('active_plugins'), true),
					'version_const' => defined('CWICLY_VERSION') ? CWICLY_VERSION : null,
				];
			`,
			{ adminPage: "index.php" },
		);
		t.check("plugin is active", value.active === true);
		t.check("CWICLY_VERSION is defined", typeof value.version_const === "string", String(value.version_const));
		t.check(
			"cc_update_db_check() stamped cwicly_db_version on an admin request",
			value.db_version === value.version_const,
			`db_version=${value.db_version} const=${value.version_const}`,
		);
		t.check("cwicly_deprecated initialised to an array", Array.isArray(value.deprecated), JSON.stringify(value.deprecated));
		t.check("no PHP notices while loading the plugin", notices.length === 0, noticeDetail(notices));
		t.check("no PHP deprecations", deprecations(notices).length === 0, noticeDetail(deprecations(notices)));
	}

	// 2. Blocks registered on init.
	{
		const { value } = await phpJson(
			server,
			`
				$registry = WP_Block_Type_Registry::get_instance();
				$names = ['cwicly/div', 'cwicly/section', 'cwicly/button', 'cwicly/columns'];
				$out = [];
				foreach ($names as $n) { $bt = $registry->get_registered($n); $out[$n] = $bt ? ($bt->render_callback ? 'dynamic' : 'static') : null; }
				return $out;
			`,
		);
		for (const [name, kind] of Object.entries(value)) {
			t.check(`block ${name} registered (${kind})`, kind !== null, String(kind));
		}
	}

	// 3. Front-end enqueues: CCnorm + CC styles and the CCers inline config.
	{
		const { value, notices } = await phpJson(
			server,
			`
				do_action('wp_enqueue_scripts');
				$s = wp_scripts()->query('CCers');
				$st = wp_styles()->query('CC');
				return [
					'ccers_src' => $s ? $s->src : null,
					'cc_ver' => $st ? $st->ver : null,
					'ccnorm' => (bool) wp_styles()->query('CCnorm'),
				];
			`,
		);
		t.check("front-end enqueues CCers script", typeof value.ccers_src === "string" && value.ccers_src.includes("ccers.min.js"), String(value.ccers_src));
		t.check("front-end enqueues the CC stylesheet", value.cc_ver !== null, String(value.cc_ver));
		t.check("front-end enqueues CCnorm", value.ccnorm === true);
		t.check("front-end enqueue produced no notices", notices.length === 0, noticeDetail(notices));
	}

	// 4. Admin screens: the themer app enqueues via its admin_print_scripts hook,
	// and the editor blocks bundle enqueues on the block-editor assets hook.
	{
		const { value, notices } = await phpJson(
			server,
			`
				do_action('admin_menu');
				do_action('admin_print_scripts-toplevel_page_cwicly');
				do_action('enqueue_block_editor_assets');
				return [
					'themer' => (bool) wp_scripts()->query('cc-themer-script'),
					'blocks' => (bool) wp_scripts()->query('cwicly_editor_blocks'),
					'blocks_css' => (bool) wp_styles()->query('cwicly_blocks_editor'),
				];
			`,
			{ adminPage: "admin.php", constants: { WP_ADMIN: true } },
		);
		t.check("themer app enqueued on its admin page", value.themer === true);
		t.check("editor blocks bundle enqueued for the block editor", value.blocks === true);
		t.check("editor blocks stylesheet enqueued", value.blocks_css === true);
		t.check("admin enqueue produced no notices", notices.length === 0, noticeDetail(notices));
	}

	// 5. REST: the entities route answers for an editor user and refuses others.
	{
		const { value } = await phpJson(
			server,
			`
				$routes = rest_get_server()->get_routes('cwicly/v' . CWICLY_API_VERSION);
				$hasEntities = isset($routes['/cwicly/v1/entities']);
				wp_set_current_user(0);
				$req = new WP_REST_Request('GET', '/cwicly/v1/entities');
				$req->set_param('type', 'breakpoints-list');
				$anon = rest_do_request($req)->get_status();
				$editor_id = wp_insert_user([
					'user_login' => 'cwicly_test_editor',
					'user_pass' => 'test-password-1',
					'role' => 'editor',
				]);
				if (!is_wp_error($editor_id)) {
					wp_set_current_user($editor_id);
					$res = rest_do_request($req);
					$editorStatus = $res->get_status();
					$body = $res->get_data();
				} else { $editorStatus = -1; $body = null; }
				return ['hasEntities' => $hasEntities, 'anon' => $anon, 'editorStatus' => $editorStatus, 'body' => $body];
			`,
			{ constants: { REST_REQUEST: true } },
		);
		t.check("REST namespace cwicly/v1 exposes /entities", value.hasEntities === true);
		t.check("anonymous GET /entities is refused", value.anon >= 400, `status=${value.anon}`);
		t.check("editor GET /entities returns 200", value.editorStatus === 200, `status=${value.editorStatus}`);
		t.check(
			"/entities returns the requested option key",
			value.body && "cwicly_breakpoints_list" in value.body,
			JSON.stringify(value.body),
		);
	}

	// 6. The gutenberg-downgrade composer dependency ships inside vendor/ and its
	// classes autoload from cwicly's autoloader (bundling contract).
	{
		const { value } = await phpJson(
			server,
			`
				return [
					'class' => class_exists(\\GutenbergDowngrade\\Plugin::class),
					'file' => file_exists(CWICLY_DIR_PATH . 'vendor/avunu/gutenberg-downgrade/gutenberg-downgrade.php'),
				];
			`,
		);
		t.check("GutenbergDowngrade\\Plugin autoloads from vendor/", value.class === true);
		t.check("gutenberg-downgrade entry file present in vendor/", value.file === true);
	}

	// 7. Self-heal: delete the db-version option, hit an admin request again,
	// and the version check re-stamps it (the migration path upgrades use).
	{
		const { value } = await phpJson(
			server,
			`
				delete_option('cwicly_db_version');
				cc_update_db_check();
				return get_option('cwicly_db_version');
			`,
			{ adminPage: "index.php" },
		);
		t.check("cc_update_db_check() re-stamps cwicly_db_version", typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value), String(value));
	}
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	process.exitCode = 1;
} finally {
	if (server) await server[Symbol.asyncDispose]();
}

process.exitCode ||= t.failures ? 1 : 0;
if (t.failures) console.log(`\n${t.failures} failure(s)`);
else console.log("\nAll PHP-level checks passed.");
