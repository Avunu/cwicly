import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/button', {
  title: __('Button', 'cwicly'),
  icon: 'button',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
