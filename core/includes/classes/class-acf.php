<?php
/**
 * ACF class file.
 *
 * @package Cwicly
 */

namespace Cwicly;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// Exit if accessed directly.

// ACF is no longer bundled with Cwicly. The official ACF / ACF Pro plugin must be
// installed separately; dynamic field support activates when its classes exist.

/**
 * All necessary actions for ACF.
 *
 * @package Cwicly
 */
class ACF {

	/**
	 * ACF constructor.
	 */
	public function __construct() {
		add_filter( 'acf/settings/url', array( $this, 'acf_url' ) );
		// Gate raw HTML in ACF values by the SAVING user. Priority 20 so it runs
		// after ACF's own input handling.
		add_filter( 'acf/update_value', array( $this, 'guard_raw_html' ), 20, 3 );
	}

	/**
	 * Set the path to the ACF plugin.
	 *
	 * Only applies while a bundled copy exists (legacy installs). External
	 * ACF plugins resolve their own URL, so return false and let ACF's
	 * default stand.
	 *
	 * @return string|false
	 */
	public function acf_url() {
		if ( defined( 'MY_ACF_PATH' ) && file_exists( MY_ACF_PATH . 'acf.php' ) ) {
			return MY_ACF_URL;
		}
		return false;
	}

	/**
	 * Escape a scalar ACF value according to the field type Cwicly is rendering.
	 * Rich ACF fields are already gated on save by guard_raw_html(); escaping
	 * them here would break intentional WYSIWYG/oEmbed output on existing sites.
	 *
	 * @param mixed $value The scalar value to render.
	 * @param array|null $field_object The ACF field object, when known.
	 * @return string
	 */
	private static function escape_scalar_value( $value, $field_object = null ) {
		if ( ! is_scalar( $value ) ) {
			return $value;
		}
		$type = is_array( $field_object ) && isset( $field_object['type'] ) ? $field_object['type'] : '';
		if ( in_array( $type, array( 'wysiwyg', 'oembed' ), true ) ) {
			return (string) $value;
		}
		$return_format = is_array( $field_object ) && isset( $field_object['return_format'] ) ? $field_object['return_format'] : '';
		if ( 'url' === $type || ( 'link' === $type && 'url' === $return_format ) ) {
			return esc_url( (string) $value );
		}
		return esc_html( (string) $value );
	}

	/**
	 * Keep untrusted users from storing unsafe HTML in ACF values.
	 *
	 * Cwicly splices ACF values straight into the page through cc_get_dyn, so an
	 * unfiltered value is a stored-XSS vector. Trust is judged by the user doing
	 * the saving (Capabilities::user_can_raw_html: the role-editor
	 * blockToolbar.dynamicRawHtml toggle, falling back to unfiltered_html). A
	 * trusted user saves whatever they like. For an untrusted user, a value
	 * carrying unsafe HTML is run through wp_kses_post UNLESS it is the existing
	 * stored value resubmitted unchanged, so saving a post an admin built does
	 * not strip the admin's embeds. Non-string and tag-free values pass through.
	 *
	 * @param mixed      $value   The value about to be saved.
	 * @param int|string $post_id ACF object id (post id, 'user_X', 'option', …).
	 * @param array      $field   The ACF field array.
	 * @return mixed
	 */
	public function guard_raw_html( $value, $post_id, $field ) {
		if ( ! is_string( $value ) || strpos( $value, '<' ) === false ) {
			return $value;
		}
		if ( \Cwicly\Capabilities::user_can_raw_html( get_current_user_id() ) ) {
			return $value;
		}
		$cleaned = wp_kses_post( $value );
		if ( $cleaned === $value ) {
			return $value;
		}
		// Preserve trusted content resubmitted unchanged (an untrusted user
		// saving a post without touching this field).
		$name = isset( $field['name'] ) ? $field['name'] : '';
		if ( $name ) {
			$existing = get_field( $name, $post_id, false );
			if ( is_string( $existing ) && wp_unslash( $value ) === $existing ) {
				return $value;
			}
		}
		return $cleaned;
	}

	/**
	 * Process ACF fields the Cwicly way.
	 *
	 * @param array  $field The field.
	 * @param string $fallback The fallback.
	 * @param array  $attributes The attributes.
	 * @param string $block_name The block name.
	 * @param bool   $frontent_rendering Whether or not we are rendering on the frontend.
	 * @param array  $options The options.
	 * @param object $field_object The field object.
	 */
	public static function processor( $field, $fallback, $attributes, $block_name, $frontent_rendering = false, $options = array(), $field_object = null ) {
		if ( $field ) {
			if ( is_array( $field ) ) {
				if ( isset( $field['url'] ) && 'cwicly/svg' !== $block_name ) {
					if ( 'cwicly/image' === $block_name && isset( $field['width'] ) && isset( $field['height'] ) ) {
						$width     = absint( $field['width'] );
						$height    = absint( $field['height'] );
						$url       = esc_url( $field['url'] );
						$alt       = isset( $field['alt'] ) ? esc_attr( $field['alt'] ) : '';
						$final_alt = '';
						if ( isset( $options[1] ) && $alt && '1' === $options[1] ) {
							$final_alt = '" alt="' . $alt . '';
						}
						$srcset        = '';
						$final_src_set = '';
						$size          = '';
						if ( isset( $options[2] ) && '1' === $options[2] && $field['id'] ) {
							$srcset = wp_get_attachment_image_srcset( $field['id'] );
							if ( $srcset ) {
								$final_src_set = '" srcset="' . esc_attr( $srcset ) . '';
							}
						}
						if ( isset( $options[0] ) && $options[0] && '0' != $options[0] && $field['sizes'] && isset( $field['sizes'][ $options[0] ] ) ) {
							if ( $field['sizes'][ $options[0] ] ) {
								$url    = esc_url( $field['sizes'][ $options[0] ] );
								$height = absint( $field['sizes'][ $options[0] . '-height' ] );
								$width  = absint( $field['sizes'][ $options[0] . '-width' ] );
								$size   = '" sizes="' . esc_attr( wp_get_attachment_image_sizes( $field['id'], $options[0] ) ) . '';
							}
						}
						if ( ! $frontent_rendering ) {
							return '' . $url . '" height="' . $height . '" width="' . $width . $final_alt . $final_src_set . $size . '';
						} else {
							$size = '';
							if ( isset( $options[0] ) && $options[0] ) {
								$size   = esc_attr( wp_get_attachment_image_sizes( $field['id'], $options[0] ) );
								$height = absint( $field['sizes'][ $options[0] . '-height' ] );
								$width  = absint( $field['sizes'][ $options[0] . '-width' ] );
							} else {
								$size = esc_attr( wp_get_attachment_image_sizes( $field['id'] ) );
							}

							return array(
								'url'    => $url,
								'width'  => $width,
								'height' => $height,
								'alt'    => $alt,
								'srcset' => $srcset,
								'size'   => $size,
							);
						}
					} else {
						if ( isset( $options[0] ) ) {
							if ( 'isVideo' === $options[0] ) {
								return \Cwicly\Helpers::get_dynamic_video_url( $attributes, $field );
							} elseif ( 'isVideoOverlay' === $options[0] ) {
								return \Cwicly\Helpers::get_dynamic_video_overlay_url( $attributes, $field );
							}
						}

						return esc_url( $field['url'] );
					}
				} elseif ( $field_object && isset( $options[0] ) && 'svg' === $options[0] && 'image' === $field_object['type'] ) {
					$svg_content = '';
					$svg_path    = get_attached_file( $field_object['value']['ID'] );

					if ( file_exists( $svg_path ) ) {
						$svg_content = file_get_contents( $svg_path );
					}

					if ( ! $svg_content ) {
						return new \WP_Error( 'error', 'SVG file not found', array( 'status' => 400 ) );
					}

					if ( isset( $options[1] ) && 'all' === $options[1] ) {
						$svg            = \Cwicly\Helpers::get_svg_content( $svg_content )['svg'];
						$svg_attributes = \Cwicly\Helpers::get_svg_attributes( $svg_content, true );
						return array(
							'content'    => $svg,
							'attributes' => $svg_attributes,
						);
					}

					if ( isset( $options[1] ) && 'viewBox' === $options[1] ) {
						$svg_attributes = \Cwicly\Helpers::get_svg_attributes( $svg_content );
						if ( $svg_attributes ) {
							return $svg_attributes;
						}
					}
					return \Cwicly\Helpers::get_svg_content( $svg_content )[ $options[1] ];
				} elseif ( $field_object && 'checkbox' === $field_object['type'] ) {
					if ( 'value' === $field_object['return_format'] || 'label' === $field_object['return_format'] ) {
						return implode( ',', $field );
					} elseif ( 'array' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f['value'] ) ) {
								$final[] = $f['value'];
							} elseif ( isset( $f['label'] ) ) {
								$final[] = $f['label'];
							}
						}

						return implode( ',', $final );
					}
				} elseif ( $field_object && 'radio' === $field_object['type'] ) {
					if ( 'value' === $field_object['return_format'] || 'label' === $field_object['return_format'] ) {
						return self::escape_scalar_value( $field, $field_object );
					} elseif ( 'array' === $field_object['return_format'] ) {
						return $field['value'];
					}
				} elseif ( $field_object && 'relationship' === $field_object['type'] ) {
					if ( 'object' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f->ID ) ) {
								$final[] = $f->ID;
							}
						}

						return implode( ',', $final );
					} elseif ( 'id' === $field_object['return_format'] ) {
						return implode( ',', $field );
					}
				} elseif ( $field_object && 'button_group' === $field_object['type'] ) {
					if ( 'value' === $field_object['return_format'] || 'label' === $field_object['return_format'] ) {
						return self::escape_scalar_value( $field, $field_object );
					} elseif ( 'array' === $field_object['return_format'] ) {
						return $field['value'];
					}
				} elseif ( $field_object && 'select' === $field_object['type'] ) {
					if ( 'value' === $field_object['return_format'] || 'label' === $field_object['return_format'] ) {
						return self::escape_scalar_value( $field, $field_object );
					} elseif ( 'array' === $field_object['return_format'] ) {
						return $field['value'];
					}
				} elseif ( $field_object && 'true_false' === $field_object['type'] ) {
					if ( 'value' === $field_object['return_format'] || 'label' === $field_object['return_format'] ) {
						return self::escape_scalar_value( $field, $field_object );
					} elseif ( 'array' === $field_object['return_format'] ) {
						return $field['value'];
					}
				} elseif ( $field_object && 'taxonomy' === $field_object['type'] ) {
					if ( 'object' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f->term_id ) ) {
								$final[] = $f->term_id;
							}
						}

						return implode( ',', $final );
					} elseif ( 'id' === $field_object['return_format'] ) {
						return implode( ',', $field );
					}
				} elseif ( $field_object && 'user' === $field_object['type'] ) {
					if ( 'object' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f->ID ) ) {
								$final[] = $f->ID;
							}
						}

						return implode( ',', $final );
					} elseif ( 'id' === $field_object['return_format'] ) {
						return implode( ',', $field );
					}
				} elseif ( $field_object && 'group' === $field_object['type'] ) {
					$final = array();
					foreach ( $field as $f ) {
						$final[] = self::processor( $f, $fallback, $attributes, $block_name, $frontent_rendering, $options, $field_object );
					}

					return implode( ',', $final );
				} elseif ( $field_object && 'post_object' === $field_object['type'] ) {
					if ( 'object' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f->ID ) ) {
								$final[] = $f->ID;
							}
						}

						return implode( ',', $final );
					} elseif ( 'id' === $field_object['return_format'] ) {
						return implode( ',', $field );
					}
				} elseif ( $field_object && 'flexible_content' === $field_object['type'] ) {
					$final = array();
					foreach ( $field as $f ) {
						$final[] = self::processor( $f, $fallback, $attributes, $block_name, $frontent_rendering, $options, $field_object );
					}

					return implode( ',', $final );
				} elseif ( $field_object && 'clone' === $field_object['type'] ) {
					$final = array();
					foreach ( $field as $f ) {
						$final[] = self::processor( $f, $fallback, $attributes, $block_name, $frontent_rendering, $options, $field_object );
					}

					return implode( ',', $final );
				} elseif ( $field_object && 'link' === $field_object['type'] ) {
					if ( 'array' === $field_object['return_format'] && isset( $field['url'] ) ) {
						return esc_url( $field['url'] );
					} elseif ( 'url' === $field_object['return_format'] ) {
						return esc_url( (string) $field );
					}
				} elseif ( $field_object && 'gallery' === $field_object['type'] ) {
					if ( 'array' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							if ( isset( $f['url'] ) ) {
								$final[] = esc_url( $f['url'] );
							}
						}

						return implode( ',', $final );
					} elseif ( 'url' === $field_object['return_format'] ) {
						$final = array();
						foreach ( $field as $f ) {
							$final[] = esc_url( $f );
						}

						return implode( ',', $final );
					}
				} elseif ( $field_object && 'repeater' === $field_object['type'] ) {
					$final = array();
					foreach ( $field as $f ) {
						$final[] = self::processor( $f, $fallback, $attributes, $block_name, $frontent_rendering, $options, $field_object );
					}

					return implode( ',', $final );
				}
			} elseif ( isset( $field ) ) {
				if ( is_object( $field ) ) {
					if ( isset( $field->ID ) ) {
						return get_permalink( $field->ID );
					}
				} else {
					if ( isset( $options[0] ) ) {
						if ( 'isVideo' === $options[0] ) {
							return \Cwicly\Helpers::get_dynamic_video_url( $attributes, $field );
						} elseif ( 'isVideoOverlay' === $options[0] ) {
							return \Cwicly\Helpers::get_dynamic_video_overlay_url( $attributes, $field );
						}
					}

					return self::escape_scalar_value( $field, $field_object );
				}
			} elseif ( $fallback && 'false' !== $fallback ) {
				if ( is_numeric( $fallback ) && 'cwicly/image' === $block_name ) {
					return esc_url( wp_get_attachment_url( $fallback ) );
				} else {
					return self::escape_scalar_value( $fallback, $field_object );
				}
			}
		} elseif ( $fallback && 'false' !== $fallback ) {
			if ( is_numeric( $fallback ) && 'cwicly/svg' === $block_name ) {
				$svg_content = '';
				$svg_path    = get_attached_file( $fallback );

				if ( file_exists( $svg_path ) ) {
					$svg_content = file_get_contents( $svg_path );
				}

				if ( ! $svg_content ) {
					return new \WP_Error( 'error', 'SVG file not found', array( 'status' => 400 ) );
				}

				if ( isset( $options[1] ) && 'viewBox' === $options[1] ) {
					$svg_attributes = \Cwicly\Helpers::get_svg_attributes( $svg_content );
					if ( $svg_attributes ) {
						return $svg_attributes;
					}
				}
				return \Cwicly\Helpers::get_svg_content( $svg_content )[ $options[1] ];
			} elseif ( is_numeric( $fallback ) && 'cwicly/image' === $block_name ) {
				return esc_url( wp_get_attachment_url( $fallback ) );
			} else {
				return self::escape_scalar_value( $fallback, $field_object );
			}
		}
	}
}
