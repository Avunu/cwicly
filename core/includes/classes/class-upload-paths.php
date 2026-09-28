<?php
/**
 * Filesystem path containment for plugin-managed uploads.
 *
 * @package cwicly
 */

namespace Cwicly;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve upload paths without allowing user-controlled path structure.
 */
final class Upload_Paths {
	/**
	 * Whether a value can be used as one path segment.
	 *
	 * Spaces, Unicode, and ordinary dots remain valid for existing font and icon
	 * names. Directory markers, separators, and null bytes do not.
	 *
	 * @param mixed $segment Candidate path segment.
	 * @return bool
	 */
	public static function is_safe_segment( $segment ) {
		if ( ! is_string( $segment ) || '' === $segment || '.' === $segment || '..' === $segment ) {
			return false;
		}

		return false === strpos( $segment, '/' )
			&& false === strpos( $segment, '\\' )
			&& false === strpos( $segment, "\0" );
	}

	/**
	 * Resolve an existing file or directory and verify that it remains in scope.
	 *
	 * @param string $scope    Trusted root directory.
	 * @param array  $segments User-controlled path segments below the root.
	 * @param string $suffix   Optional extension including the leading dot.
	 * @return string|false
	 */
	public static function resolve_existing( $scope, $segments, $suffix = '' ) {
		if ( ! self::valid_request( $segments, $suffix ) ) {
			return false;
		}

		$scope_path     = realpath( $scope );
		$candidate_path = realpath( trailingslashit( $scope ) . implode( '/', $segments ) . $suffix );

		return self::contained_path( $scope_path, $candidate_path );
	}

	/**
	 * Resolve a target that does not exist yet through an existing parent directory.
	 *
	 * @param string $scope    Trusted root directory.
	 * @param array  $segments User-controlled path segments below the root.
	 * @param string $suffix   Optional extension including the leading dot.
	 * @return string|false
	 */
	public static function resolve_target( $scope, $segments, $suffix = '' ) {
		if ( ! self::valid_request( $segments, $suffix ) ) {
			return false;
		}

		$requested_segments = $segments;
		$filename           = array_pop( $segments ) . $suffix;
		$scope_path         = realpath( $scope );
		$parent_path        = empty( $segments )
			? $scope_path
			: realpath( trailingslashit( $scope ) . implode( '/', $segments ) );
		$contained_parent = self::contained_path( $scope_path, $parent_path, true );

		if ( false === $contained_parent ) {
			return false;
		}

		$target = trailingslashit( $contained_parent ) . $filename;
		if ( file_exists( $target ) || is_link( $target ) ) {
			return self::resolve_existing( $scope, $requested_segments, $suffix );
		}

		return $target;
	}

	/**
	 * Validate the untrusted portion of a path request.
	 *
	 * @param array  $segments Path segments.
	 * @param string $suffix   Optional extension.
	 * @return bool
	 */
	private static function valid_request( $segments, $suffix ) {
		if ( ! is_array( $segments ) || empty( $segments ) ) {
			return false;
		}

		if ( '' !== $suffix && ( ! is_string( $suffix ) || 1 !== preg_match( '/^\.[a-z0-9]+$/iD', $suffix ) ) ) {
			return false;
		}

		foreach ( $segments as $segment ) {
			if ( ! self::is_safe_segment( $segment ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Return a normalized candidate only when it is below the normalized scope.
	 *
	 * @param string|false $scope_path     Resolved scope.
	 * @param string|false $candidate_path Resolved candidate.
	 * @param bool         $allow_scope    Whether the scope itself is a valid parent.
	 * @return string|false
	 */
	private static function contained_path( $scope_path, $candidate_path, $allow_scope = false ) {
		if ( false === $scope_path || false === $candidate_path ) {
			return false;
		}

		$scope_path     = wp_normalize_path( $scope_path );
		$candidate_path = wp_normalize_path( $candidate_path );

		if ( $allow_scope && $candidate_path === $scope_path ) {
			return $candidate_path;
		}

		if ( 0 !== strpos( $candidate_path, trailingslashit( $scope_path ) ) ) {
			return false;
		}

		return $candidate_path;
	}
}
