import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit.js';
import save from './save.js';

registerBlockType('cwicly/button', {
  title: __('Button', 'cwicly'),
  icon: 'button',
  category: 'cwicly',
  attributes: {
    content: {
      type: 'string',
      source: 'html',
      selector: '.cc-btn',
      default: '',
    },
    uniqueID: {
      type: 'string',
    },
    classID: {
      type: 'string',
    },
    classes: {
      type: 'string',
      default: '',
    },
    // Link attributes (standard across blocks)
    linkWrapperActive: { type: 'boolean', default: true }, // Button is a link by default in Cwicly
    linkWrapperUrl: { type: 'string', default: '' },
    linkWrapperNewTab: { type: 'boolean', default: false },
    linkWrapperRel: { type: 'string', default: '' },
    linkWrapperTitle: { type: 'string', default: '' },
    linkWrapperType: { type: 'string', default: 'url' },
    linkWrapperSourceType: { type: 'string', default: 'static' },
    // Cwicly standard attributes
    isStyling: { type: 'boolean', default: true },
    skeletonActive: { type: 'boolean', default: true },
    htmlAttributes: { type: 'array', default: [] },
    relativeStyles: { type: 'array', default: [] },
    customCSS: { type: 'string', default: '' },
    interactions: { type: 'object', default: { click: [], dbclick: [], scrollinview: [] } },
  },
  supports: {
    anchor: true,
    html: false,
  },
  edit,
  save,
});
