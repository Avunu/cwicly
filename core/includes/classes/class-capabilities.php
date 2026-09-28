<?php
/**
 * Capabilities.
 *
 * @package cwicly
 */

namespace Cwicly;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// Exit if accessed directly.
/**
 * Capabilities helpers.
 */
class Capabilities {

	/**
	 * Get the capabilities of the user.
	 *
	 * @param string $type      Type of capability.
	 * @param string $condition Condition of capability.
	 * @param bool   $force     Force the capability.
	 *
	 * @return bool
	 */
	public static function permission( $type, $condition, $force = false ) {
		if ( is_admin() && ! $force ) {
			return;
		}
		$user_roles   = Helpers::get_current_user_roles();
		$role_editor  = get_option( 'cwicly_role_editor' );
		$current_user = get_current_user_id();

		$final = false;

		if ( $user_roles && is_array( $user_roles ) && count( $user_roles ) > 0 && $role_editor && is_array( $role_editor ) && count( $role_editor ) > 0 ) {
			if ( isset( $current_user ) && isset( $role_editor[ 'user_' . $current_user ] ) ) {
				if ( get_post_type() && isset( $role_editor[ 'user_' . $current_user ]['postTypes']['hideList'] ) && in_array( get_post_type(), $role_editor[ 'user_' . $current_user ]['postTypes']['hideList'], true ) ) {
					return false;
				} else {
					if ( isset( $role_editor[ 'user_' . $current_user ][ $type ][ $condition ] ) ) {
						$final = $role_editor[ 'user_' . $current_user ][ $type ][ $condition ];
					}
					return $final;
				}
			} elseif ( isset( $role_editor ) ) {
				if ( get_post_type() && isset( $user_roles[0] ) && isset( $role_editor[ $user_roles[0] ]['postTypes']['hideList'] ) && in_array( get_post_type(), $role_editor[ $user_roles[0] ]['postTypes']['hideList'], true ) ) {
					return false;
				} else {
					$user_roles = wp_get_current_user()->roles;
					foreach ( $role_editor as $role => $value ) {
						if ( array_intersect( $user_roles, array( $role ) ) ) {
							if ( isset( $value[ $type ][ $condition ] ) ) {
								$final = $value[ $type ][ $condition ];
							}
						}
					}
					return $final;
				}
			}
		}
	}

	/**
	 * Check to see if the user can save PHP to the database.
	 */
	public static function code_block_php() {
		if ( ! self::execute_eval() ) {
			return false;
		}

		$capability = self::permission( 'codeBlock', 'php', true );

		return apply_filters( 'cwicly/code/php', $capability );
	}


	/**
	 * Check to see if the user can save JS to the database.
	 */
	public static function code_block_js() {
		$capability = self::permission( 'codeBlock', 'js', true );

		return apply_filters( 'cwicly/code/js', $capability );
	}

	/**
	 * Check to see if eval is allowed.
	 */
	public static function execute_eval() {
		return apply_filters( 'cwicly/code/execute_eval', true );
	}

	/**
	 * Options that an editor-capable user (edit_posts) may write through the
	 * REST option/entity endpoints. This is the plugin's own building data.
	 *
	 * Anything NOT in this list is rejected by can_write_option() unless it is
	 * an admin-only option (see admin_only_options) written by a manage_options
	 * user. This blocks both WordPress core options (which carry no cwicly_
	 * prefix, e.g. default_role / siteurl / users_can_register) and the
	 * security-governing cwicly options below — the inherited takeover vector.
	 *
	 * @return string[]
	 */
	public static function editor_writable_options() {
		return array(
			'cwicly_design_auth',
			'cwicly_gmap',
			'cwicly_local_fonts',
			'cwicly_local_active_fonts',
			'cwicly_css',
			'cwicly_global_fonts',
			'cwicly_global_css_fonts',
			'cwicly_breakpoints',
			'cwicly_breakpoints_list',
			'cwicly_section_defaults',
			'cwicly_global_css',
			'cwicly_pseudos',
			'cwicly_collection',
			'cwicly_regenerate_html',
			'cwicly_global_classes',
			'cwicly_global_classes_folders',
			'cwicly_global_classes_rendered',
			'cwicly_external_classes',
			'cwicly_shells',
			'cwicly_optimise',
			'cwicly_deprecated',
			'cwicly_global_styles',
			'cwicly_global_parts',
			'cwicly_global_interactions',
			'cwicly_conditions',
			'cwicly_pre_conditions',
			'cwicly_font_cols',
			'cwicly_svg_cols',
			'cwicly_components_folders',
			'cwicly_classes_add',
			'cwicly_darkmode_selectors',
			'cwicly_lightmode_selectors',
			'cwicly_global_stylesheets',
			'cwicly_global_stylesheets_folders',
			'cwicly_global_stylesheets_rendered',
			'cwicly_tailwind',
			'cwicly_tailwind_classes',
			'cwicly_tailwind_configurations',
			'cwicly_tailwind_fonts',
		);
	}

	/**
	 * Security-governing options that must only ever be written by a
	 * manage_options user. Writing any of these from an edit_posts account is a
	 * privilege-escalation primitive: forge code signatures (cwicly_salt),
	 * grant code-execution capabilities (cwicly_role_editor), disable SSL
	 * verification on remote fetches (cwicly_ssl_verify), or expose ACF over
	 * REST (cwicly_acf_rest_frontend).
	 *
	 * @return string[]
	 */
	public static function admin_only_options() {
		return array(
			'cwicly_role_editor',
			'cwicly_salt',
			'cwicly_ssl_verify',
			'cwicly_acf_rest_frontend',
			'cwicly_scss_compiler',
			'cwicly_block_rules',
		);
	}

	/**
	 * Whether the current user may read or replace private design-library keys.
	 *
	 * The editor hides the Design Library using this same role-editor setting.
	 * Enforce it at the REST storage boundary as well, because the client-side
	 * encrypted values can be decrypted by anyone who receives them.
	 *
	 * @return bool
	 */
	public static function can_access_design_library() {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		return (bool) self::permission( 'gutenbergEditor', 'designLibrary', true );
	}

	/**
	 * Whether the current user may access the given option through the plugin's
	 * REST endpoints, under the inherited edit_posts trust model.
	 *
	 * @param string $option Option name.
	 * @return bool
	 */
	public static function can_access_option( $option ) {
		if ( 'cwicly_design_auth' === $option ) {
			return self::can_access_design_library();
		}

		if ( in_array( $option, self::admin_only_options(), true ) ) {
			return current_user_can( 'manage_options' );
		}
		return in_array( $option, self::editor_writable_options(), true );
	}

	/**
	 * Write-policy name used by the entity endpoints.
	 *
	 * @param string $option Option name.
	 * @return bool
	 */
	public static function can_write_option( $option ) {
		return self::can_access_option( $option );
	}

	/**
	 * Resolve a role-editor capability for a SPECIFIC user, not the current one.
	 *
	 * permission() above judges the user performing an action right now. On the
	 * front end the "current user" is the visitor, so dynamic output has to be
	 * judged by who AUTHORED the content instead. A per-user override wins over
	 * the user's role settings. Returns null when neither is explicitly set, so
	 * the caller can fall back (see user_can_raw_html).
	 *
	 * @param int    $user_id   The content author.
	 * @param string $type      Capability group.
	 * @param string $condition Capability key.
	 * @return bool|null
	 */
	public static function permission_for_user( $user_id, $type, $condition ) {
		$role_editor = get_option( 'cwicly_role_editor' );
		if ( ! $user_id || ! is_array( $role_editor ) || ! $role_editor ) {
			return null;
		}
		if ( isset( $role_editor[ 'user_' . $user_id ][ $type ][ $condition ] ) ) {
			return (bool) $role_editor[ 'user_' . $user_id ][ $type ][ $condition ];
		}
		$user = get_userdata( $user_id );
		if ( ! $user || empty( $user->roles ) ) {
			return null;
		}
		foreach ( $user->roles as $role ) {
			if ( isset( $role_editor[ $role ][ $type ][ $condition ] ) ) {
				return (bool) $role_editor[ $role ][ $type ][ $condition ];
			}
		}
		return null;
	}

	/**
	 * Whether this user may save raw HTML through dynamic fields.
	 *
	 * The explicit role-editor toggle (blockToolbar.dynamicRawHtml) wins. With
	 * nothing set, falls back to WordPress's own unfiltered_html capability,
	 * which is "admins + editors on, everyone else off" on a single site.
	 * Checked against the saving user when an ACF value is updated; an untrusted
	 * user's newly-saved unsafe HTML is run through wp_kses_post (see
	 * Cwicly\ACF::guard_raw_html), while values they leave unchanged are kept.
	 *
	 * @param int $user_id The user saving the value.
	 * @return bool
	 */
	public static function user_can_raw_html( $user_id ) {
		$explicit = self::permission_for_user( $user_id, 'blockToolbar', 'dynamicRawHtml' );
		if ( null !== $explicit ) {
			return $explicit;
		}
		return user_can( $user_id, 'unfiltered_html' );
	}
}
