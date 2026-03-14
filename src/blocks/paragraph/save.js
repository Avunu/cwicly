import { RichText } from '@wordpress/block-editor';
import { getBlockID, getLinkAttributes, getInteractions } from '../../utils/index.js';

export default function save({ attributes }) {
  const blockID = getBlockID(attributes, 'paragraph');
  const linkAttrs = getLinkAttributes(attributes, 'paragraph');
  const interactions = getInteractions(attributes);
  
  const linkWrapperActive = attributes.linkWrapperActive || linkAttrs?.href;
  const Tag = linkWrapperActive ? (attributes.containerLayoutTag || 'a') : (attributes.containerLayoutTag || 'p');

  return (
    <Tag
      id={blockID}
      {...linkAttrs}
      {...interactions}
      className={attributes.className}
    >
      <RichText.Content value={attributes.content} />
    </Tag>
  );
}
