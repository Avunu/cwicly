import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/heading', {
  title: __('Heading', 'cwicly'),
  icon: 'heading',
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
