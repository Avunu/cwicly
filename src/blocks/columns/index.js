import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/columns', {
  title: __('Columns', 'cwicly'),
  description: __('Organize your content into multiple columns with flexible layouts.', 'cwicly'),
  icon: 'columns', // Placeholder icon
  category: 'layout',
  supports: {
    anchor: true,
    align: true,
    html: false,
  },
  edit,
  save,
});
