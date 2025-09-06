<?php
declare( strict_types=1 );

// Prevent direct access
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Check if user has permission to delete plugins
if ( ! current_user_can( 'delete_plugins' ) ) {
    return;
}

// Check if we're in a multisite environment
if ( is_multisite() ) {
    // Get all sites in the network
    $sites = get_sites( array( 'fields' => 'ids' ) );
    
    foreach ( $sites as $site_id ) {
        switch_to_blog( $site_id );
        rate_compare_cleanup_data();
        restore_current_blog();
    }
} else {
    rate_compare_cleanup_data();
}

/**
 * Clean up plugin data
 */
function rate_compare_cleanup_data(): void {
    // Remove plugin options
    delete_option( 'rate_compare_activated' );
    delete_option( 'rate_compare_settings' );
    delete_option( 'rate_compare_version' );
    delete_option( 'rate_compare_channels' );
    delete_option( 'rate_compare_api_keys' );
    
    // Remove transients
    global $wpdb;
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
            '_transient_rate_compare_%',
            '_transient_timeout_rate_compare_%'
        )
    );
    
    // Remove scheduled events
    wp_clear_scheduled_hook( 'rate_compare_cleanup_cache' );
    wp_clear_scheduled_hook( 'rate_compare_fetch_rates' );
    
    // Remove custom database tables if they exist
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}rate_compare_channels" );
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}rate_compare_rates" );
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}rate_compare_properties" );
    
    // Remove user meta
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE %s",
            'rate_compare_%'
        )
    );
    
    // Remove post meta
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE %s",
            'rate_compare_%'
        )
    );
    
    // Remove any custom capabilities
    $role = get_role( 'administrator' );
    if ( $role ) {
        $role->remove_cap( 'manage_rate_compare' );
        $role->remove_cap( 'edit_rate_compare_settings' );
    }
}
