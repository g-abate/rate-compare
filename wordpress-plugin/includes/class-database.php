<?php
declare( strict_types=1 );

namespace Rate_Compare;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Database class
 *
 * @package Rate_Compare
 * @since 1.0.0
 */
class Database {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'init', array( $this, 'create_tables' ) );
    }
    
    /**
     * Create database tables
     */
    public function create_tables(): void {
        // Placeholder for database table creation
    }
}
