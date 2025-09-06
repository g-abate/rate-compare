/**
 * Rate Compare Admin JavaScript
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

(function($) {
    'use strict';

    // Admin object
    window.RateCompareAdmin = {
        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            // Add channel button
            $(document).on('click', '.add-channel', this.addChannel);
            
            // Remove channel button
            $(document).on('click', '.remove-channel', this.removeChannel);
            
            // Test API key button
            $(document).on('click', '.test-api-key', this.testApiKey);
            
            // Toggle API key visibility
            $(document).on('click', '.toggle-visibility', this.toggleApiKeyVisibility);
            
            // Save settings
            $(document).on('click', '.save-settings', this.saveSettings);
        },

        addChannel: function(e) {
            e.preventDefault();
            
            var channelHtml = '<div class="channel-config">' +
                '<select name="channels[][type]">' +
                    '<option value="airbnb">Airbnb</option>' +
                    '<option value="vrbo">VRBO</option>' +
                    '<option value="booking">Booking.com</option>' +
                '</select>' +
                '<input type="url" name="channels[][url]" placeholder="Enter property URL" required>' +
                '<button type="button" class="remove-channel">Remove</button>' +
                '</div>';
            
            $('.channels-container').append(channelHtml);
        },

        removeChannel: function(e) {
            e.preventDefault();
            $(this).closest('.channel-config').remove();
        },

        testApiKey: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $container = $button.closest('.api-key-field');
            var apiKey = $container.find('input').val();
            var $results = $container.find('.test-results');
            
            if (!apiKey) {
                RateCompareAdmin.showTestResults($results, 'error', 'Please enter an API key');
                return;
            }
            
            $button.addClass('loading');
            $results.hide();
            
            // Simulate API test (replace with actual AJAX call)
            setTimeout(function() {
                $button.removeClass('loading');
                RateCompareAdmin.showTestResults($results, 'success', 'API key is valid');
            }, 2000);
        },

        showTestResults: function($container, type, message) {
            $container.removeClass('success error')
                .addClass(type)
                .html(message)
                .show();
        },

        toggleApiKeyVisibility: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $input = $button.siblings('input');
            
            if ($input.attr('type') === 'password') {
                $input.attr('type', 'text');
                $button.text('Hide');
            } else {
                $input.attr('type', 'password');
                $button.text('Show');
            }
        },

        saveSettings: function(e) {
            e.preventDefault();
            
            var $form = $(this).closest('form');
            var $button = $(this);
            
            $button.addClass('loading');
            
            // Simulate save (replace with actual AJAX call)
            setTimeout(function() {
                $button.removeClass('loading');
                RateCompareAdmin.showNotice('Settings saved successfully', 'success');
            }, 1000);
        },

        showNotice: function(message, type) {
            var noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
            var notice = '<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>';
            
            $('.rate-compare-admin h1').after(notice);
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                $('.notice').fadeOut();
            }, 5000);
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        RateCompareAdmin.init();
    });

})(jQuery);
