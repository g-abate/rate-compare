<?php
declare( strict_types=1 );

namespace Rate_Compare;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Admin functionality class
 *
 * @package Rate_Compare
 * @since 1.0.0
 */
class Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu(): void {
        add_menu_page(
            __( 'Rate Compare', 'rate-compare' ),
            __( 'Rate Compare', 'rate-compare' ),
            'manage_options',
            'rate-compare',
            array( $this, 'admin_page' ),
            'dashicons-chart-line',
            30
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings(): void {
        register_setting( 'rate_compare_settings', 'rate_compare_settings' );
    }
    
    /**
     * Admin page callback
     */
    public function admin_page(): void {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'Rate Compare Settings', 'rate-compare' ); ?></h1>
            <p><?php esc_html_e( 'Configure your rate comparison settings below.', 'rate-compare' ); ?></p>
        </div>
        <?php
    }
}
