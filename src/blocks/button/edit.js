import { useBlockProps, RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps({
    className: 'cwicly-button-placeholder',
  });

  return (
    <div {...blockProps}>
      <RichText
        tagName="span"
        value={attributes.content}
        onChange={(content) => setAttributes({ content })}
        placeholder={__('Button text...', 'cwicly')}
      />
    </div>
  );
}
