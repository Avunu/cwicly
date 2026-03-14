import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/image', {
  title: __('Image', 'cwicly'),
  icon: 'format-image',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
