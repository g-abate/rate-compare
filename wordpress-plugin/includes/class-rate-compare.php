<?php
declare( strict_types=1 );

namespace Rate_Compare;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main plugin class
 *
 * @package Rate_Compare
 * @since 1.0.0
 */
final class Rate_Compare {
    
    /**
     * Plugin instance
     *
     * @var Rate_Compare|null
     */
    private static ?Rate_Compare $instance = null;
    
    /**
     * Plugin version
     *
     * @var string
     */
    public const VERSION = RATE_COMPARE_VERSION;
    
    /**
     * Plugin slug
     *
     * @var string
     */
    public const SLUG = RATE_COMPARE_PLUGIN_SLUG;
    
    /**
     * Text domain
     *
     * @var string
     */
    public const TEXT_DOMAIN = RATE_COMPARE_TEXT_DOMAIN;
    
    /**
     * Get plugin instance
     *
     * @return Rate_Compare
     */
    public static function get_instance(): Rate_Compare {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->load_dependencies();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks(): void {
        add_action( 'init', array( $this, 'init' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
        add_action( 'wp_ajax_rate_compare_get_rates', array( $this, 'ajax_get_rates' ) );
        add_action( 'wp_ajax_nopriv_rate_compare_get_rates', array( $this, 'ajax_get_rates' ) );
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies(): void {
        // Load core classes
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-rate-compare-admin.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-rate-compare-public.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-channel-manager.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-rate-fetcher.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-rate-cache.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-rate-comparison.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-ownerrez-api.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-web-scraper.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/class-database.php';
        require_once RATE_COMPARE_PLUGIN_DIR . 'includes/functions.php';
    }
    
    /**
     * Initialize plugin
     */
    public function init(): void {
        // Initialize admin
        if ( is_admin() ) {
            new Admin();
        }
        
        // Initialize public
        new Public();
        
        // Initialize database
        new Database();
        
        // Initialize channel manager
        new Channel_Manager();
        
        // Initialize rate fetcher
        new Rate_Fetcher();
        
        // Initialize rate cache
        new Rate_Cache();
        
        // Initialize rate comparison
        new Rate_Comparison();
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts(): void {
        wp_enqueue_script(
            'rate-compare',
            RATE_COMPARE_PLUGIN_URL . 'assets/js/rate-compare.js',
            array( 'jquery' ),
            self::VERSION,
            true
        );
        
        wp_enqueue_style(
            'rate-compare',
            RATE_COMPARE_PLUGIN_URL . 'assets/css/rate-compare.css',
            array(),
            self::VERSION
        );
        
        // Localize script
        wp_localize_script(
            'rate-compare',
            'rateCompare',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce' => wp_create_nonce( 'rate_compare_nonce' ),
                'strings' => array(
                    'loading' => __( 'Loading rates...', 'rate-compare' ),
                    'error' => __( 'Error loading rates', 'rate-compare' ),
                    'noRates' => __( 'No rates available', 'rate-compare' ),
                ),
            )
        );
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function admin_enqueue_scripts( string $hook ): void {
        // Only load on plugin pages
        if ( strpos( $hook, 'rate-compare' ) === false ) {
            return;
        }
        
        wp_enqueue_script(
            'rate-compare-admin',
            RATE_COMPARE_PLUGIN_URL . 'admin/js/admin.js',
            array( 'jquery' ),
            self::VERSION,
            true
        );
        
        wp_enqueue_style(
            'rate-compare-admin',
            RATE_COMPARE_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            self::VERSION
        );
    }
    
    /**
     * AJAX handler for getting rates
     */
    public function ajax_get_rates(): void {
        // Verify nonce
        if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ?? '' ) ), 'rate_compare_nonce' ) ) {
            wp_die( esc_html__( 'Security check failed', 'rate-compare' ) );
        }
        
        // Check user capability
        if ( ! current_user_can( 'read' ) ) {
            wp_die( esc_html__( 'Insufficient permissions', 'rate-compare' ) );
        }
        
        // Get and sanitize input
        $property_id = sanitize_text_field( wp_unslash( $_POST['property_id'] ?? '' ) );
        $check_in = sanitize_text_field( wp_unslash( $_POST['check_in'] ?? '' ) );
        $check_out = sanitize_text_field( wp_unslash( $_POST['check_out'] ?? '' ) );
        
        if ( empty( $property_id ) || empty( $check_in ) || empty( $check_out ) ) {
            wp_send_json_error( array( 'message' => __( 'Missing required parameters', 'rate-compare' ) ) );
        }
        
        // Get rates
        $rate_fetcher = new Rate_Fetcher();
        $rates = $rate_fetcher->get_rates( $property_id, $check_in, $check_out );
        
        if ( is_wp_error( $rates ) ) {
            wp_send_json_error( array( 'message' => $rates->get_error_message() ) );
        }
        
        wp_send_json_success( $rates );
    }
    
    /**
     * Get plugin version
     *
     * @return string
     */
    public function get_version(): string {
        return self::VERSION;
    }
    
    /**
     * Get plugin slug
     *
     * @return string
     */
    public function get_slug(): string {
        return self::SLUG;
    }
    
    /**
     * Prevent cloning
     */
    private function __clone() {}
    
    /**
     * Prevent unserializing
     */
    public function __wakeup() {
        throw new \Exception( 'Cannot unserialize singleton' );
    }
}
