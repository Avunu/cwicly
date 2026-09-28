<?php

declare(strict_types=1);

// Constants WordPress defines at runtime (wp-settings.php) that are not part
// of php-stubs/wordpress-stubs.
define('WPINC', 'wp-includes');

// cwicly.php reads these via get_option()/plugin paths at analysis time only;
// defining them keeps the entrypoint analysable without a wp-load.
define('CWICLY_FILE', __DIR__ . '/cwicly.php');
define('CWICLY_DIR_PATH', __DIR__ . '/');
define('CWICLY_DIR_URL', 'http://localhost/wp-content/plugins/cwicly/');
