<?php
/**
 * Core functionality tests
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

use Rate_Compare\Rate_Compare;

/**
 * Test core plugin functionality
 */
class Test_Rate_Compare_Core extends WP_UnitTestCase {

    /**
     * Test plugin activation
     */
    public function test_plugin_activation() {
        $this->assertTrue( defined( 'RATE_COMPARE_VERSION' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_PLUGIN_FILE' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_PLUGIN_DIR' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_PLUGIN_URL' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_PLUGIN_BASENAME' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_PLUGIN_SLUG' ) );
        $this->assertTrue( defined( 'RATE_COMPARE_TEXT_DOMAIN' ) );
    }

    /**
     * Test plugin constants
     */
    public function test_plugin_constants() {
        $this->assertEquals( '1.0.0', RATE_COMPARE_VERSION );
        $this->assertEquals( 'rate-compare', RATE_COMPARE_PLUGIN_SLUG );
        $this->assertEquals( 'rate-compare', RATE_COMPARE_TEXT_DOMAIN );
    }

    /**
     * Test plugin instance
     */
    public function test_plugin_instance() {
        $instance = Rate_Compare::get_instance();
        $this->assertInstanceOf( 'Rate_Compare\Rate_Compare', $instance );
        
        // Test singleton pattern
        $instance2 = Rate_Compare::get_instance();
        $this->assertSame( $instance, $instance2 );
    }

    /**
     * Test plugin version getter
     */
    public function test_get_version() {
        $instance = Rate_Compare::get_instance();
        $this->assertEquals( '1.0.0', $instance->get_version() );
    }

    /**
     * Test plugin slug getter
     */
    public function test_get_slug() {
        $instance = Rate_Compare::get_instance();
        $this->assertEquals( 'rate-compare', $instance->get_slug() );
    }

    /**
     * Test utility functions
     */
    public function test_utility_functions() {
        // Test get_option
        $this->assertFalse( rate_compare_get_option( 'non_existent_option' ) );
        $this->assertEquals( 'default', rate_compare_get_option( 'non_existent_option', 'default' ) );
        
        // Test update_option
        $this->assertTrue( rate_compare_update_option( 'test_option', 'test_value' ) );
        $this->assertEquals( 'test_value', rate_compare_get_option( 'test_option' ) );
        
        // Test delete_option
        $this->assertTrue( rate_compare_delete_option( 'test_option' ) );
        $this->assertFalse( rate_compare_get_option( 'test_option' ) );
    }

    /**
     * Test channel URL sanitization
     */
    public function test_sanitize_channel_url() {
        // Valid URLs
        $this->assertEquals( 'https://airbnb.com/rooms/123', rate_compare_sanitize_channel_url( 'https://airbnb.com/rooms/123' ) );
        $this->assertEquals( 'https://vrbo.com/property/456', rate_compare_sanitize_channel_url( 'https://vrbo.com/property/456' ) );
        $this->assertEquals( 'https://booking.com/hotel/test', rate_compare_sanitize_channel_url( 'https://booking.com/hotel/test' ) );
        
        // Invalid URLs
        $this->assertEquals( '', rate_compare_sanitize_channel_url( 'invalid-url' ) );
        $this->assertEquals( '', rate_compare_sanitize_channel_url( 'https://unsupported.com/property/123' ) );
    }

    /**
     * Test property ID extraction
     */
    public function test_extract_property_id() {
        $this->assertEquals( '123', rate_compare_extract_property_id( 'https://airbnb.com/rooms/123' ) );
        $this->assertEquals( '456', rate_compare_extract_property_id( 'https://vrbo.com/property/456' ) );
        $this->assertEquals( 'test', rate_compare_extract_property_id( 'https://booking.com/hotel/test' ) );
        $this->assertEquals( '', rate_compare_extract_property_id( 'https://unsupported.com/property/123' ) );
    }

    /**
     * Test channel name extraction
     */
    public function test_get_channel_name() {
        $this->assertEquals( 'Airbnb', rate_compare_get_channel_name( 'https://airbnb.com/rooms/123' ) );
        $this->assertEquals( 'VRBO', rate_compare_get_channel_name( 'https://vrbo.com/property/456' ) );
        $this->assertEquals( 'Booking.com', rate_compare_get_channel_name( 'https://booking.com/hotel/test' ) );
        $this->assertEquals( '', rate_compare_get_channel_name( 'https://unsupported.com/property/123' ) );
    }

    /**
     * Test currency formatting
     */
    public function test_format_currency() {
        $this->assertEquals( '$100.00', rate_compare_format_currency( 100, 'USD' ) );
        $this->assertEquals( '€100.00', rate_compare_format_currency( 100, 'EUR' ) );
        $this->assertEquals( '£100.00', rate_compare_format_currency( 100, 'GBP' ) );
        $this->assertEquals( '100.00 CAD', rate_compare_format_currency( 100, 'CAD' ) );
    }

    /**
     * Test savings calculation
     */
    public function test_calculate_savings_percentage() {
        $this->assertEquals( 20.0, rate_compare_calculate_savings_percentage( 100, 80 ) );
        $this->assertEquals( 0.0, rate_compare_calculate_savings_percentage( 0, 80 ) );
        $this->assertEquals( 0.0, rate_compare_calculate_savings_percentage( 100, 100 ) );
    }

    /**
     * Test supported channels
     */
    public function test_get_supported_channels() {
        $channels = rate_compare_get_supported_channels();
        $this->assertIsArray( $channels );
        $this->assertArrayHasKey( 'airbnb', $channels );
        $this->assertArrayHasKey( 'vrbo', $channels );
        $this->assertArrayHasKey( 'booking', $channels );
    }
}
