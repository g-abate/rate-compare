<?php
declare( strict_types=1 );

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Plugin utility functions
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

/**
 * Get plugin option
 *
 * @param string $option_name Option name.
 * @param mixed  $default     Default value.
 * @return mixed
 */
function rate_compare_get_option( string $option_name, $default = false ) {
    $options = get_option( 'rate_compare_settings', array() );
    return $options[ $option_name ] ?? $default;
}

/**
 * Update plugin option
 *
 * @param string $option_name Option name.
 * @param mixed  $value       Option value.
 * @return bool
 */
function rate_compare_update_option( string $option_name, $value ): bool {
    $options = get_option( 'rate_compare_settings', array() );
    $options[ $option_name ] = $value;
    return update_option( 'rate_compare_settings', $options );
}

/**
 * Delete plugin option
 *
 * @param string $option_name Option name.
 * @return bool
 */
function rate_compare_delete_option( string $option_name ): bool {
    $options = get_option( 'rate_compare_settings', array() );
    unset( $options[ $option_name ] );
    return update_option( 'rate_compare_settings', $options );
}

/**
 * Sanitize channel URL
 *
 * @param string $url Channel URL.
 * @return string
 */
function rate_compare_sanitize_channel_url( string $url ): string {
    $url = esc_url_raw( $url );
    
    // Validate URL format
    if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
        return '';
    }
    
    // Check if URL is from supported channels
    $supported_domains = array(
        'airbnb.com',
        'vrbo.com',
        'booking.com',
    );
    
    $parsed_url = wp_parse_url( $url );
    if ( ! isset( $parsed_url['host'] ) ) {
        return '';
    }
    
    $host = strtolower( $parsed_url['host'] );
    foreach ( $supported_domains as $domain ) {
        if ( strpos( $host, $domain ) !== false ) {
            return $url;
        }
    }
    
    return '';
}

/**
 * Extract property ID from channel URL
 *
 * @param string $url Channel URL.
 * @return string
 */
function rate_compare_extract_property_id( string $url ): string {
    $url = rate_compare_sanitize_channel_url( $url );
    if ( empty( $url ) ) {
        return '';
    }
    
    $parsed_url = wp_parse_url( $url );
    $host = strtolower( $parsed_url['host'] ?? '' );
    
    // Airbnb
    if ( strpos( $host, 'airbnb.com' ) !== false ) {
        if ( preg_match( '/\/rooms\/(\d+)/', $url, $matches ) ) {
            return sanitize_text_field( $matches[1] );
        }
    }
    
    // VRBO
    if ( strpos( $host, 'vrbo.com' ) !== false ) {
        if ( preg_match( '/\/property\/(\d+)/', $url, $matches ) ) {
            return sanitize_text_field( $matches[1] );
        }
    }
    
    // Booking.com
    if ( strpos( $host, 'booking.com' ) !== false ) {
        if ( preg_match( '/\/hotel\/([^\/]+)/', $url, $matches ) ) {
            return sanitize_text_field( $matches[1] );
        }
    }
    
    return '';
}

/**
 * Get channel name from URL
 *
 * @param string $url Channel URL.
 * @return string
 */
function rate_compare_get_channel_name( string $url ): string {
    $url = rate_compare_sanitize_channel_url( $url );
    if ( empty( $url ) ) {
        return '';
    }
    
    $parsed_url = wp_parse_url( $url );
    $host = strtolower( $parsed_url['host'] ?? '' );
    
    if ( strpos( $host, 'airbnb.com' ) !== false ) {
        return 'Airbnb';
    }
    
    if ( strpos( $host, 'vrbo.com' ) !== false ) {
        return 'VRBO';
    }
    
    if ( strpos( $host, 'booking.com' ) !== false ) {
        return 'Booking.com';
    }
    
    return '';
}

/**
 * Format currency
 *
 * @param float  $amount   Amount to format.
 * @param string $currency Currency code.
 * @return string
 */
function rate_compare_format_currency( float $amount, string $currency = 'USD' ): string {
    $formatted = number_format( $amount, 2 );
    
    switch ( strtoupper( $currency ) ) {
        case 'USD':
            return '$' . $formatted;
        case 'EUR':
            return '€' . $formatted;
        case 'GBP':
            return '£' . $formatted;
        default:
            return $formatted . ' ' . $currency;
    }
}

/**
 * Calculate savings percentage
 *
 * @param float $original_price Original price.
 * @param float $discounted_price Discounted price.
 * @return float
 */
function rate_compare_calculate_savings_percentage( float $original_price, float $discounted_price ): float {
    if ( $original_price <= 0 ) {
        return 0;
    }
    
    $savings = ( ( $original_price - $discounted_price ) / $original_price ) * 100;
    return round( $savings, 2 );
}

/**
 * Log error message
 *
 * @param string $message Error message.
 * @param string $context Context.
 * @return void
 */
function rate_compare_log_error( string $message, string $context = '' ): void {
    if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
        return;
    }
    
    $log_message = sprintf(
        '[Rate Compare] %s',
        $context ? "{$context}: {$message}" : $message
    );
    
    error_log( $log_message );
}

/**
 * Check if plugin is active
 *
 * @return bool
 */
function rate_compare_is_active(): bool {
    return get_option( 'rate_compare_activated', false );
}

/**
 * Get plugin data
 *
 * @return array
 */
function rate_compare_get_plugin_data(): array {
    if ( ! function_exists( 'get_plugin_data' ) ) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    return get_plugin_data( RATE_COMPARE_PLUGIN_FILE );
}

/**
 * Get supported channels
 *
 * @return array
 */
function rate_compare_get_supported_channels(): array {
    return array(
        'airbnb' => array(
            'name' => 'Airbnb',
            'domain' => 'airbnb.com',
            'api_available' => false,
        ),
        'vrbo' => array(
            'name' => 'VRBO',
            'domain' => 'vrbo.com',
            'api_available' => false,
        ),
        'booking' => array(
            'name' => 'Booking.com',
            'domain' => 'booking.com',
            'api_available' => false,
        ),
    );
}
