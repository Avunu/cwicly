import { useBlockProps, RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <RichText
        tagName={attributes.headingTag || 'h1'}
        value={attributes.content}
        onChange={(content) => setAttributes({ content })}
        placeholder={__('Heading content...', 'cwicly')}
      />
    </div>
  );
}
