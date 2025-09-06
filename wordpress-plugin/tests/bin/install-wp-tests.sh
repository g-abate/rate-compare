#!/usr/bin/env bash

if [ $# -lt 3 ]; then
    echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [skip-database-creation]"
    echo "example: $0 wordpress_test root '' localhost latest"
    exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASS=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}
SKIP_DB_CREATE=${6-false}

WP_TESTS_DIR=${WP_TESTS_DIR-/tmp/wordpress-tests-lib}
WP_CORE_DIR=${WP_CORE_DIR-/tmp/wordpress/}

download() {
    if [ `which curl` ]; then
        curl -s "$1" > "$2";
    elif [ `which wget` ]; then
        wget -nv -O "$2" "$1"
    fi
}

if [[ $WP_VERSION == 'latest' ]]; then
    # Get the latest WordPress version
    WP_VERSION=$(download https://api.wordpress.org/core/version-check/1.7/ /tmp/wp-latest.json && grep -o '"version":"[^"]*' /tmp/wp-latest.json | sed 's/"version":"//')
fi

WP_TESTS_TAG="tags/$WP_VERSION"

if [ -d $WP_TESTS_DIR ]; then
    echo "Removing existing WordPress test directory..."
    rm -rf $WP_TESTS_DIR
fi

if [ -d $WP_CORE_DIR ]; then
    echo "Removing existing WordPress core directory..."
    rm -rf $WP_CORE_DIR
fi

echo "Downloading WordPress $WP_VERSION..."

if [ $WP_VERSION == 'latest' ]; then
    local ARCHIVE_NAME='latest'
else
    local ARCHIVE_NAME="wordpress-$WP_VERSION"
fi

download https://wordpress.org/${ARCHIVE_NAME}.tar.gz /tmp/wordpress.tar.gz
tar --strip-components=1 -zxmf /tmp/wordpress.tar.gz -C /tmp/
mv /tmp/wordpress $WP_CORE_DIR

echo "Downloading WordPress test suite..."

if [ $WP_VERSION == 'latest' ]; then
    local BRANCH='master'
else
    local BRANCH="tags/$WP_VERSION"
fi

if [ -d $WP_TESTS_DIR ]; then
    rm -rf $WP_TESTS_DIR
fi

mkdir -p $WP_TESTS_DIR
svn co --quiet https://develop.svn.wordpress.org/${BRANCH}/tests/phpunit/includes/ $WP_TESTS_DIR/includes
svn co --quiet https://develop.svn.wordpress.org/${BRANCH}/tests/phpunit/data/ $WP_TESTS_DIR/data

if [ ! -f wp-tests-config.php ]; then
    download https://develop.svn.wordpress.org/${BRANCH}/wp-tests-config-sample.php $WP_TESTS_DIR/wp-tests-config.php
fi

# Create the wp-tests-config.php file
cat > $WP_TESTS_DIR/wp-tests-config.php << EOF
<?php
// Test suite configuration
define( 'DB_NAME', '$DB_NAME' );
define( 'DB_USER', '$DB_USER' );
define( 'DB_PASSWORD', '$DB_PASS' );
define( 'DB_HOST', '$DB_HOST' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );

define( 'WP_PHP_BINARY', 'php' );
define( 'WP_TESTS_FORCE_KNOWN_BUGS', true );

// Test with multisite enabled
define( 'WP_TESTS_MULTISITE', false );

// You can override this in a phpunit.xml file
if ( ! defined( 'WP_TESTS_DIR' ) ) {
    define( 'WP_TESTS_DIR', dirname( __FILE__ ) . '/' );
}

if ( ! defined( 'WP_CORE_DIR' ) ) {
    define( 'WP_CORE_DIR', '$WP_CORE_DIR' );
}

// Load the WordPress test environment
require_once( WP_TESTS_DIR . 'includes/functions.php' );

// Load the plugin
function _manually_load_plugin() {
    require dirname( dirname( __FILE__ ) ) . '/rate-compare.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment
require WP_TESTS_DIR . 'includes/bootstrap.php';
EOF

echo "WordPress test suite installed successfully!"
echo "WP_TESTS_DIR: $WP_TESTS_DIR"
echo "WP_CORE_DIR: $WP_CORE_DIR"
