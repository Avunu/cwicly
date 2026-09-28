<?php

/**
 * Bootstrap for the pure-unit suite.
 *
 * WordPress is deliberately NOT loaded: Brain Monkey works by defining the
 * WordPress functions itself, so they must be undefined when a test starts.
 *
 * Load order: the plugin's own vendor/ first, so plugin code runs against the
 * dependency versions it ships; then the test toolchain; then the plugin's
 * class files (there is no PSR-4 autoload for them — cwicly loads everything
 * through require_once chains that need a full ABSPATH).
 */

declare(strict_types=1);

$root = dirname(__DIR__, 2);

$pluginVendor = $root . '/vendor';
if (!is_file($pluginVendor . '/autoload.php')) {
    fwrite(STDERR, "Plugin dependencies are not installed: run `composer install`.\n");
    exit(1);
}
require_once $pluginVendor . '/autoload.php';

$toolsVendor = $root . '/tests/tools/vendor';
if (!is_file($toolsVendor . '/autoload.php')) {
    fwrite(STDERR, "Test toolchain is not installed: run `composer install --working-dir=tests/tools`.\n");
    exit(1);
}
require_once $toolsVendor . '/autoload.php';

// Test classes: a plain PSR-4 loader keeps them out of the shipped code.
spl_autoload_register(static function (string $class) use ($root): void {
    $prefix = 'Cwicly\\Tests\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $file = $root . '/tests/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

// The constants cwicly.php defines at load time, and which the class files
// guard on (`if ( ! defined( 'ABSPATH' ) ) exit;`). Defining ABSPATH here lets
// individual class files be required directly without running the whole
// plugin bootstrap.
define('ABSPATH', $root . '/');
define('WPINC', 'wp-includes');
define('CWICLY_FILE', $root . '/cwicly.php');
define('CWICLY_DIR_PATH', $root . '/');
define('CWICLY_DIR_URL', 'http://localhost/wp-content/plugins/cwicly/');
define('CWICLY_VERSION', '1.4.8');
define('CWICLY_API_VERSION', '1');
define('CC_WOOCOMMERCE', false);
define('CC_CLASSES', '{}');

// Unit-tested plugin classes, required explicitly (no autoloader in the
// plugin itself). Add files here as suites cover them.
require_once $root . '/core/includes/classes/class-capabilities.php';
require_once $root . '/core/includes/classes/class-helpers.php';
