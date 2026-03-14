import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/section', {
  title: __('Section', 'cwicly'),
  icon: 'layout',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
