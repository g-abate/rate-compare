/**
 * Rate Compare Plugin JavaScript
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

(function($) {
    'use strict';

    // Rate Compare object
    window.RateCompare = {
        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            // Rate compare button click
            $(document).on('click', '.rate-compare-button', this.handleRateCompareClick);
            
            // Modal close
            $(document).on('click', '.rate-compare-close', this.closeModal);
            
            // Click outside modal to close
            $(document).on('click', '.rate-compare-modal', function(e) {
                if (e.target === this) {
                    RateCompare.closeModal();
                }
            });
        },

        handleRateCompareClick: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $container = $button.closest('.rate-compare-shortcode');
            
            var propertyId = $container.data('property-id');
            var checkIn = $container.data('check-in');
            var checkOut = $container.data('check-out');
            
            if (!propertyId) {
                RateCompare.showError('Property ID is required');
                return;
            }
            
            RateCompare.showModal();
            RateCompare.fetchRates(propertyId, checkIn, checkOut);
        },

        fetchRates: function(propertyId, checkIn, checkOut) {
            var data = {
                action: 'rate_compare_get_rates',
                property_id: propertyId,
                check_in: checkIn,
                check_out: checkOut,
                nonce: rateCompare.nonce
            };
            
            $.ajax({
                url: rateCompare.ajaxUrl,
                type: 'POST',
                data: data,
                beforeSend: function() {
                    RateCompare.showLoading();
                },
                success: function(response) {
                    if (response.success) {
                        RateCompare.displayRates(response.data);
                    } else {
                        RateCompare.showError(response.data.message || rateCompare.strings.error);
                    }
                },
                error: function() {
                    RateCompare.showError(rateCompare.strings.error);
                }
            });
        },

        showModal: function() {
            $('#rate-compare-modal').show();
        },

        closeModal: function() {
            $('#rate-compare-modal').hide();
        },

        showLoading: function() {
            $('#rate-compare-content').html('<p class="rate-loading">' + rateCompare.strings.loading + '</p>');
        },

        showError: function(message) {
            $('#rate-compare-content').html('<div class="rate-error">' + message + '</div>');
        },

        displayRates: function(rates) {
            if (!rates || rates.length === 0) {
                RateCompare.showError(rateCompare.strings.noRates);
                return;
            }
            
            var html = '<div class="rate-comparison">';
            
            rates.forEach(function(rate) {
                html += '<div class="rate-item">';
                html += '<div class="rate-channel">' + rate.channel + '</div>';
                html += '<div class="rate-price">' + rate.price + '</div>';
                if (rate.savings) {
                    html += '<div class="rate-savings">Save ' + rate.savings + '%</div>';
                }
                html += '</div>';
            });
            
            html += '</div>';
            
            $('#rate-compare-content').html(html);
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        RateCompare.init();
    });

})(jQuery);
