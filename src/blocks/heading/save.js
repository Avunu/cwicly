import { RichText } from '@wordpress/block-editor';
import { getBlockID, getLinkAttributes, getInteractions } from '../../utils/index.js';

export default function save({ attributes }) {
  const Tag = attributes.headingTag || 'h1';
  const blockID = getBlockID(attributes, 'heading');
  const linkAttrs = getLinkAttributes(attributes, 'heading');
  const interactions = getInteractions(attributes);
  
  const linkWrapperActive = attributes.linkWrapperActive || linkAttrs?.href;
  const LinkTag = (!attributes.containerLayoutTag || (attributes.containerLayoutTag !== 'a' && attributes.containerLayoutTag !== 'button')) ? 'a' : attributes.containerLayoutTag;

  return (
    <Tag
      id={blockID}
      {...interactions}
      className={attributes.className}
    >
      {linkWrapperActive ? (
        <LinkTag {...linkAttrs}>
          <RichText.Content value={attributes.content} />
        </LinkTag>
      ) : (
        <RichText.Content value={attributes.content} />
      )}
    </Tag>
  );
}
