<?php
/**
 * Cwicly Query API.
 *
 * @package cwicly
 */

namespace Cwicly;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Cwicly Query API.
 */
class Admin_API extends \WP_REST_Controller {
	private const MAX_ICON_BYTES = 2097152;
	private const MAX_FONT_BYTES = 10485760;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->register_routes();
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		$namespace = 'cwicly/v' . CWICLY_API_VERSION;

		register_rest_route(
			$namespace,
			'/upload_icon',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'upload_icon' ),
					'permission_callback' => array( '\Cwicly\Helpers', 'permissions_check_admin' ),
					'args'                => array(),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/upload_font',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'upload_font' ),
					'permission_callback' => array( '\Cwicly\Helpers', 'permissions_check_admin' ),
					'args'                => array(),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'settings' ),
					'permission_callback' => array( '\Cwicly\Helpers', 'permissions_check_admin' ),
					'args'                => array(),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/themes',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'change_theme' ),
					'permission_callback' => array( '\Cwicly\Helpers', 'permissions_check_admin' ),
					'args'                => array(),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/cwicly_global_classes_save',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_global_classes' ),
					'permission_callback' => array( '\Cwicly\Helpers', 'permissions_check_admin' ),
					'args'                => array(),
				),
			)
		);
	}

	/**
	 * Process Icon upload
	 *
	 *  @param \WP_REST_Request $request Full details about the request.
	 */
	public function upload_icon( $request ) {
		try {
			$files = $request->get_file_params();

			if ( empty( $files['file'] ) || empty( $files['file']['name'] ) || empty( $files['file']['tmp_name'] ) ) {
				return new \WP_Error( 'no_file', 'No file uploaded.', array( 'status' => 400 ) );
			}

			$file = $files['file'];
			if ( isset( $file['error'] ) && UPLOAD_ERR_OK !== (int) $file['error'] ) {
				return new \WP_Error( 'upload_failed', 'The icon upload failed.', array( 'status' => 400 ) );
			}

			$icon_name = pathinfo( (string) $file['name'], PATHINFO_FILENAME );
			$extension = strtolower( pathinfo( (string) $file['name'], PATHINFO_EXTENSION ) );
			if ( 'svg' !== $extension || ! Upload_Paths::is_safe_segment( $icon_name ) ) {
				return new \WP_Error( 'invalid_icon_name', 'Only safely named SVG files are allowed.', array( 'status' => 400 ) );
			}

			$file_size = filesize( $file['tmp_name'] );
			if ( false === $file_size || $file_size > self::MAX_ICON_BYTES ) {
				return new \WP_Error( 'file_too_large', 'SVG files must be 2 MB or smaller.', array( 'status' => 400 ) );
			}

			$svg = file_get_contents( $file['tmp_name'] );
			if ( false === $svg ) {
				return new \WP_Error( 'unreadable_svg', 'Unable to read the SVG file.', array( 'status' => 400 ) );
			}

			$svg = Svg::sanitize_inline( $svg );
			if ( '' === $svg || 1 !== preg_match( '/<svg(?:\s|>)/i', $svg ) ) {
				return new \WP_Error( 'invalid_svg', 'The SVG file is invalid or unsafe.', array( 'status' => 400 ) );
			}

			$scope = $this->prepare_upload_scope( 'icons' );
			if ( false === $scope ) {
				return new \WP_Error( 'upload_directory_error', 'Unable to prepare the icon directory.', array( 'status' => 500 ) );
			}

			$target_file = Upload_Paths::resolve_target( $scope, array( $icon_name ), '.svg' );
			if ( false === $target_file || false === file_put_contents( $target_file, $svg, LOCK_EX ) ) {
				return new \WP_Error( 'upload_write_failed', 'Unable to save the SVG file.', array( 'status' => 500 ) );
			}

			return array(
				'success' => true,
				'message' => 'Successful upload',
			);
		} catch ( \Throwable $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}

	/**
	 * Process Font upload
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 */
	public function upload_font( $request ) {
		try {
			$params = $request->get_params();
			$files  = $request->get_file_params();

			if ( isset( $params['deleteFontVariation'] ) && $params['deleteFontVariation'] && isset( $params['fontName'] ) && $params['fontName'] ) {
				$font_name           = (string) $params['fontName'];
				$font_name_variation = (string) $params['deleteFontVariation'];
				if ( ! Upload_Paths::is_safe_segment( $font_name ) || ! Upload_Paths::is_safe_segment( $font_name_variation ) ) {
					return new \WP_Error( 'invalid_font_path', 'Invalid font path.', array( 'status' => 400 ) );
				}

				$scope = $this->prepare_upload_scope( 'fonts' );
				$file  = false === $scope ? false : Upload_Paths::resolve_existing( $scope, array( $font_name, $font_name_variation ), '.woff2' );
				if ( $file ) {
					wp_delete_file( $file );
				}
			}

			if ( isset( $params['deleteFont'] ) ) {
				$font_name = (string) $params['deleteFont'];
				if ( ! Upload_Paths::is_safe_segment( $font_name ) ) {
					return new \WP_Error( 'invalid_font_path', 'Invalid font path.', array( 'status' => 400 ) );
				}

				$scope    = $this->prepare_upload_scope( 'fonts' );
				$font_dir = false === $scope ? false : Upload_Paths::resolve_existing( $scope, array( $font_name ) );
				if ( $font_dir ) {
					require_once ABSPATH . 'wp-admin/includes/file.php';
					global $wp_filesystem;
					if ( ! WP_Filesystem() || ! $wp_filesystem || ! $wp_filesystem->delete( $font_dir, true, 'd' ) ) {
						return new \WP_Error( 'font_delete_failed', 'Unable to delete the font directory.', array( 'status' => 500 ) );
					}
				}
			}

			if ( isset( $files['file'] ) && isset( $params['fontName'] ) ) {
				$file      = $files['file'];
				$font_name = (string) $params['fontName'];
				$file_name = isset( $file['name'] ) ? (string) $file['name'] : '';
				if ( ! Upload_Paths::is_safe_segment( $font_name ) || ! Upload_Paths::is_safe_segment( $file_name ) ) {
					return new \WP_Error( 'invalid_font_path', 'Invalid font path.', array( 'status' => 400 ) );
				}

				if ( isset( $file['error'] ) && UPLOAD_ERR_OK !== (int) $file['error'] ) {
					return new \WP_Error( 'upload_failed', 'The font upload failed.', array( 'status' => 400 ) );
				}

				if ( 'woff2' !== strtolower( pathinfo( $file_name, PATHINFO_EXTENSION ) ) ) {
					return new \WP_Error( 'wrong_file_type', 'Only WOFF2 files are allowed.', array( 'status' => 400 ) );
				}

				$file_size = ! empty( $file['tmp_name'] ) ? filesize( $file['tmp_name'] ) : false;
				if ( false === $file_size || $file_size > self::MAX_FONT_BYTES ) {
					return new \WP_Error( 'file_too_large', 'WOFF2 files must be 10 MB or smaller.', array( 'status' => 400 ) );
				}

				if ( 'wOF2' !== file_get_contents( $file['tmp_name'], false, null, 0, 4 ) ) {
					return new \WP_Error( 'invalid_woff2', 'The uploaded file is not a valid WOFF2 font.', array( 'status' => 400 ) );
				}

				$scope = $this->prepare_upload_scope( 'fonts' );
				if ( false === $scope || ( ! is_dir( $scope . $font_name ) && ! wp_mkdir_p( $scope . $font_name ) ) ) {
					return new \WP_Error( 'upload_directory_error', 'Unable to prepare the font directory.', array( 'status' => 500 ) );
				}

				$target_file = Upload_Paths::resolve_target( $scope, array( $font_name, $file_name ) );
				if ( false === $target_file || ! move_uploaded_file( $file['tmp_name'], $target_file ) ) {
					return new \WP_Error( 'upload_write_failed', 'Unable to save the WOFF2 file.', array( 'status' => 500 ) );
				}
			}
			return array(
				'success' => true,
				'message' => 'Successful upload',
			);
		} catch ( \Throwable $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}

	/**
	 * Remove Icon
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 */
	public function settings( $request ) {
		try {
			$params = $request->get_params();

			if ( isset( $params['deleteIcon'] ) ) {
				$icon_name = (string) $params['deleteIcon'];
				if ( ! Upload_Paths::is_safe_segment( $icon_name ) ) {
					return new \WP_Error( 'invalid_icon_path', 'Invalid icon path.', array( 'status' => 400 ) );
				}

				$scope       = $this->prepare_upload_scope( 'icons' );
				$target_file = false === $scope ? false : Upload_Paths::resolve_existing( $scope, array( $icon_name ), '.svg' );
				if ( $target_file ) {
					wp_delete_file( $target_file );
				}
			}

			return array(
				'success' => true,
				'message' => 'Settings updated.',
			);
		} catch ( \Throwable $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}

	/**
	 * Ensure one trusted plugin upload directory exists.
	 *
	 * @param string $area Allowed upload area.
	 * @return string|false
	 */
	private function prepare_upload_scope( $area ) {
		if ( ! in_array( $area, array( 'fonts', 'icons' ), true ) ) {
			return false;
		}

		$upload_dir = wp_upload_dir();
		if ( empty( $upload_dir['basedir'] ) || ! empty( $upload_dir['error'] ) ) {
			return false;
		}

		$scope = trailingslashit( $upload_dir['basedir'] ) . 'cwicly/' . $area . '/';
		if ( ! is_dir( $scope ) && ! wp_mkdir_p( $scope ) ) {
			return false;
		}

		return $scope;
	}

	/**
	 * Change Theme
	 *
	 * @param object $data Request data.
	 */
	public function change_theme( $data ) {
		try {

			if ( null !== $data->get_param( 'install' ) && $data->get_param( 'install' ) ) {
				$this->install_themer();
			}

			if ( null !== $data->get_param( 'settheme' ) && $data->get_param( 'settheme' ) ) {
				if ( $data->get_param( 'settheme' ) === 'default' ) {
					switch_theme( WP_DEFAULT_THEME );
				} else {
					switch_theme( $data->get_param( 'settheme' ) );
				}
			}

			$themes = wp_get_themes();
			foreach ( $themes as $theme ) {
				$theme->description = wp_strip_all_tags( $theme->description );
				$theme->name        = wp_strip_all_tags( $theme->name );
			}

			return array(
				'active'  => get_stylesheet(),
				'result'  => $themes,
				'default' => WP_DEFAULT_THEME,
			);
		} catch ( \Exception $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}

	/**
	 * Install the cwicly theme.
	 *
	 * @return bool
	 */
	public function install_themer() {
		// includes necessary for Plugin_Upgrader and Plugin_Installer_Skin.
		include_once ABSPATH . 'wp-admin/includes/file.php';
		include_once ABSPATH . 'wp-admin/includes/misc.php';
		include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

		wp_cache_flush();

		$theme = CWICLY_DIR_PATH . 'core/assets/theme/cwicly_theme_v1.0.3.zip';

		$upgrader  = new \Theme_Upgrader( new \Cwicly_Theme_Upgrader_Skin() );
		$installed = $upgrader->install( $theme );

		if ( ! is_wp_error( $installed ) && $installed && wp_get_theme( 'cwicly' )->exists() ) {
			switch_theme( 'cwicly' );
		}

		return $installed;
	}

	/**
	 * Update Global Classes.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return array
	 * @throws Exception If settings parameter is missing.
	 */
	public function update_global_classes( $request ) {
		try {
			$params = $request->get_params();
			if ( ! isset( $params['settings'] ) ) {
				throw new \Exception( 'Settings parameter is missing!' );
			}

			$settings = $params['settings'];

			cc_make_global_css( $settings );

			return array(
				'success' => true,
				'message' => 'Global Classes CSS updated!',
			);
		} catch ( \Exception $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}
}
