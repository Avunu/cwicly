import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/column', {
  title: __('Column', 'cwicly'),
  parent: ['cwicly/columns'],
  icon: 'column',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
