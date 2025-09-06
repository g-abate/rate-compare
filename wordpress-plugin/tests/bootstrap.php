<?php
/**
 * PHPUnit bootstrap file
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

// Define test constants
define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );
define( 'WP_PHP_BINARY', 'php' );
define( 'WP_TESTS_FORCE_KNOWN_BUGS', true );

// Define plugin constants
define( 'RATE_COMPARE_PLUGIN_FILE', dirname( __DIR__ ) . '/rate-compare.php' );
define( 'RATE_COMPARE_PLUGIN_DIR', dirname( __DIR__ ) . '/' );
define( 'RATE_COMPARE_PLUGIN_URL', 'http://example.org/wp-content/plugins/rate-compare/' );
define( 'RATE_COMPARE_PLUGIN_BASENAME', 'rate-compare/rate-compare.php' );
define( 'RATE_COMPARE_PLUGIN_SLUG', 'rate-compare' );
define( 'RATE_COMPARE_TEXT_DOMAIN', 'rate-compare' );
define( 'RATE_COMPARE_VERSION', '1.0.0' );

// Load WordPress test environment
$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL;
    exit( 1 );
}

// Give access to tests_add_filter() function
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested
 */
function _manually_load_plugin() {
    require RATE_COMPARE_PLUGIN_FILE;
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment
require $_tests_dir . '/includes/bootstrap.php';
