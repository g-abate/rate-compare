<?php
declare( strict_types=1 );

namespace Rate_Compare;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Public functionality class
 *
 * @package Rate_Compare
 * @since 1.0.0
 */
class Public {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'wp_footer', array( $this, 'add_rate_comparison_modal' ) );
        add_shortcode( 'rate_compare', array( $this, 'rate_compare_shortcode' ) );
    }
    
    /**
     * Add rate comparison modal to footer
     */
    public function add_rate_comparison_modal(): void {
        ?>
        <div id="rate-compare-modal" class="rate-compare-modal" style="display: none;">
            <div class="rate-compare-modal-content">
                <span class="rate-compare-close">&times;</span>
                <div id="rate-compare-content">
                    <p><?php esc_html_e( 'Loading rates...', 'rate-compare' ); ?></p>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Rate compare shortcode
     *
     * @param array $atts Shortcode attributes.
     * @return string
     */
    public function rate_compare_shortcode( array $atts ): string {
        $atts = shortcode_atts(
            array(
                'property_id' => '',
                'check_in' => '',
                'check_out' => '',
            ),
            $atts,
            'rate_compare'
        );
        
        if ( empty( $atts['property_id'] ) ) {
            return '<p>' . esc_html__( 'Property ID is required', 'rate-compare' ) . '</p>';
        }
        
        ob_start();
        ?>
        <div class="rate-compare-shortcode" 
             data-property-id="<?php echo esc_attr( $atts['property_id'] ); ?>"
             data-check-in="<?php echo esc_attr( $atts['check_in'] ); ?>"
             data-check-out="<?php echo esc_attr( $atts['check_out'] ); ?>">
            <button class="rate-compare-button">
                <?php esc_html_e( 'Compare Rates', 'rate-compare' ); ?>
            </button>
        </div>
        <?php
        
        return ob_get_clean();
    }
}
