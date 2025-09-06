<?php
declare( strict_types=1 );

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Plugin Name: Rate Compare
 * Plugin URI: https://github.com/g-abate/rate-compare
 * Description: A WordPress plugin for comparing short-term rental rates across multiple booking channels including Airbnb, VRBO, and Booking.com.
 * Version: 1.0.0
 * Author: Gideon Abate
 * Author URI: https://github.com/g-abate
 * Text Domain: rate-compare
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Network: false
 * Update URI: https://github.com/g-abate/rate-compare
 */

// Define plugin constants
define( 'RATE_COMPARE_VERSION', '1.0.0' );
define( 'RATE_COMPARE_PLUGIN_FILE', __FILE__ );
define( 'RATE_COMPARE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RATE_COMPARE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'RATE_COMPARE_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'RATE_COMPARE_PLUGIN_SLUG', 'rate-compare' );
define( 'RATE_COMPARE_TEXT_DOMAIN', 'rate-compare' );

// Minimum WordPress version check
if ( version_compare( get_bloginfo( 'version' ), '5.0', '<' ) ) {
    add_action( 'admin_notices', 'rate_compare_wordpress_version_notice' );
    return;
}

// Minimum PHP version check
if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
    add_action( 'admin_notices', 'rate_compare_php_version_notice' );
    return;
}

/**
 * Display WordPress version notice
 */
function rate_compare_wordpress_version_notice(): void {
    $message = sprintf(
        /* translators: 1: Current WordPress version, 2: Required WordPress version */
        __( 'Rate Compare requires WordPress %2$s or higher. You are running WordPress %1$s. Please upgrade WordPress.', 'rate-compare' ),
        get_bloginfo( 'version' ),
        '5.0'
    );
    
    printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
}

/**
 * Display PHP version notice
 */
function rate_compare_php_version_notice(): void {
    $message = sprintf(
        /* translators: 1: Current PHP version, 2: Required PHP version */
        __( 'Rate Compare requires PHP %2$s or higher. You are running PHP %1$s. Please upgrade PHP.', 'rate-compare' ),
        PHP_VERSION,
        '7.4'
    );
    
    printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
}

// Load Composer autoloader if available
if ( file_exists( RATE_COMPARE_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once RATE_COMPARE_PLUGIN_DIR . 'vendor/autoload.php';
}

// Load text domain
add_action( 'init', 'rate_compare_load_textdomain' );

/**
 * Load plugin text domain for internationalization
 */
function rate_compare_load_textdomain(): void {
    load_plugin_textdomain(
        RATE_COMPARE_TEXT_DOMAIN,
        false,
        dirname( RATE_COMPARE_PLUGIN_BASENAME ) . '/languages'
    );
}

// Activation and deactivation hooks
register_activation_hook( __FILE__, 'rate_compare_activate' );
register_deactivation_hook( __FILE__, 'rate_compare_deactivate' );

/**
 * Plugin activation handler
 */
function rate_compare_activate(): void {
    // Check WordPress version
    if ( version_compare( get_bloginfo( 'version' ), '5.0', '<' ) ) {
        deactivate_plugins( RATE_COMPARE_PLUGIN_BASENAME );
        wp_die(
            esc_html__( 'Rate Compare requires WordPress 5.0 or higher.', 'rate-compare' ),
            esc_html__( 'Plugin Activation Error', 'rate-compare' ),
            array( 'back_link' => true )
        );
    }
    
    // Check PHP version
    if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
        deactivate_plugins( RATE_COMPARE_PLUGIN_BASENAME );
        wp_die(
            esc_html__( 'Rate Compare requires PHP 7.4 or higher.', 'rate-compare' ),
            esc_html__( 'Plugin Activation Error', 'rate-compare' ),
            array( 'back_link' => true )
        );
    }
    
    // Set activation flag
    update_option( 'rate_compare_activated', true );
    
    // Flush rewrite rules
    flush_rewrite_rules();
}

/**
 * Plugin deactivation handler
 */
function rate_compare_deactivate(): void {
    // Clear any scheduled events
    wp_clear_scheduled_hook( 'rate_compare_cleanup_cache' );
    
    // Flush rewrite rules
    flush_rewrite_rules();
}

// Initialize the plugin
add_action( 'plugins_loaded', 'rate_compare_init' );

/**
 * Initialize the plugin
 */
function rate_compare_init(): void {
    // Check if plugin is properly activated
    if ( ! get_option( 'rate_compare_activated' ) ) {
        return;
    }
    
    // Initialize the main plugin class
    if ( class_exists( 'Rate_Compare' ) ) {
        Rate_Compare::get_instance();
    }
}
