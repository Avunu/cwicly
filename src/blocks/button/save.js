import { RichText } from '@wordpress/block-editor';
import { getBlockID, getLinkAttributes, getInteractions } from '../../utils/index.js';

export default function save({ attributes }) {
  const blockID = getBlockID(attributes, 'button');
  const linkAttrs = getLinkAttributes(attributes, 'button');
  const interactions = getInteractions(attributes);
  
  const Tag = (!attributes.containerLayoutTag || (attributes.containerLayoutTag !== 'a' && attributes.containerLayoutTag !== 'button')) ? 'a' : attributes.containerLayoutTag;

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
