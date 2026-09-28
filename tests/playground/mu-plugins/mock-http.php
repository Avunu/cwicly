<?php
/**
 * Test-only HTTP mocks for the wp-playground harness.
 *
 * The playground sandbox has no outbound network, and every remote call Cwicly
 * makes is either a Google Fonts download (REST-triggered) or an optional
 * third-party script (Maps). Stub them deterministically so tests never depend
 * on the internet and never hit a 30s curl timeout.
 */

defined('ABSPATH') || exit;

add_filter(
    'pre_http_request',
    static function ($preempt, $args, $url) {
        $host = wp_parse_url($url, PHP_URL_HOST);
        if (!$host) {
            return $preempt;
        }
        // Google Fonts CSS + woff2 files, and the Maps JS API.
        if (
            strpos($host, 'fonts.googleapis.com') !== false ||
            strpos($host, 'fonts.gstatic.com') !== false ||
            strpos($host, 'maps.googleapis.com') !== false ||
            strpos($host, 'cwicly.com') !== false
        ) {
            $body = '';
            $content_type = 'text/plain';
            if (strpos($host, 'fonts.gstatic.com') !== false && substr($url, -6) === '.woff2') {
                // A syntactically valid but empty-enough WOFF2 header is not
                // required: the plugin only writes the bytes to disk.
                $body = "\x77\x4f\x46\x32\x00\x01\x00\x00";
                $content_type = 'font/woff2';
            } elseif (strpos($host, 'fonts.googleapis.com') !== false) {
                $body = "/* mocked google fonts css */\n@font-face{font-family:'Mocked';src:url(https://fonts.gstatic.com/s/mocked.woff2) format('woff2');}";
                $content_type = 'text/css';
            }
            return [
                'response' => ['code' => 200, 'message' => 'OK'],
                'headers' => new Requests_Utility_CaseInsensitiveDictionary(['Content-Type' => $content_type]),
                'body' => $body,
                'cookies' => [],
            ];
        }
        return $preempt;
    },
    10,
    3
);
