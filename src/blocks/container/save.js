import { InnerBlocks } from '@wordpress/block-editor';
import { getBlockID, getLinkAttributes, getInteractions } from '../../utils/index.js';

export default function save({ attributes }) {
  const blockID = getBlockID(attributes, 'container');
  const linkAttrs = getLinkAttributes(attributes, 'container');
  const interactions = getInteractions(attributes);
  
  const Tag = (attributes.linkWrapperActive || linkAttrs?.href)
    ? (attributes.containerLayoutTag || 'a')
    : (attributes.containerLayoutTag || 'div');

  return (
    <Tag
      id={blockID}
      {...linkAttrs}
      {...interactions}
      className={attributes.className}
    >
      <InnerBlocks.Content />
    </Tag>
  );
}
