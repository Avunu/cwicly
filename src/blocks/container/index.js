import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/container', {
  title: __('Container', 'cwicly'),
  icon: 'editor-table',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
