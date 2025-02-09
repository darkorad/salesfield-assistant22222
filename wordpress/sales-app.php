
<?php
/*
Plugin Name: Sales App
Description: Sales management application
Version: 1.0
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enqueue React build files
function sales_app_enqueue_scripts() {
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Enqueue main CSS
    wp_enqueue_style(
        'sales-app-styles',
        $plugin_url . 'build/assets/main.css',
        array(),
        '1.0.0'
    );

    // Enqueue main JS
    wp_enqueue_script(
        'sales-app-main',
        $plugin_url . 'build/assets/main.js',
        array(),
        '1.0.0',
        true
    );

    // Pass WordPress data to React
    wp_localize_script(
        'sales-app-main',
        'wpData',
        array(
            'apiUrl' => rest_url(),
            'nonce' => wp_create_nonce('wp_rest'),
            'pluginUrl' => $plugin_url
        )
    );
}
add_action('wp_enqueue_scripts', 'sales_app_enqueue_scripts');

// Add menu page
function sales_app_add_menu() {
    add_menu_page(
        'Sales App',
        'Sales App',
        'manage_options',
        'sales-app',
        'sales_app_render_app',
        'dashicons-store',
        30
    );
}
add_action('admin_menu', 'sales_app_add_menu');

// Render app container
function sales_app_render_app() {
    echo '<div id="root"></div>';
}

// Add shortcode
function sales_app_shortcode() {
    return '<div id="root"></div>';
}
add_shortcode('sales_app', 'sales_app_shortcode');

// Add REST API endpoint for app data
function sales_app_register_routes() {
    register_rest_route('sales-app/v1', '/settings', array(
        'methods' => 'GET',
        'callback' => 'sales_app_get_settings',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        }
    ));
}
add_action('rest_api_init', 'sales_app_register_routes');

function sales_app_get_settings() {
    return array(
        'success' => true,
        'data' => array(
            'site_name' => get_bloginfo('name'),
            'site_url' => get_bloginfo('url')
        )
    );
}
