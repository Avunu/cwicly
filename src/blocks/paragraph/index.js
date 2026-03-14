import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/paragraph', {
  title: __('Paragraph', 'cwicly'),
  icon: 'editor-paragraph',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
