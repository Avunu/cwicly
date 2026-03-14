import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps({
    className: 'cwicly-image-placeholder',
  });

  return (
    <div {...blockProps}>
      <p>{__('Cwicly Image Placeholder', 'cwicly')}</p>
      {attributes.imageURL ? (
        <img src={attributes.imageURL} alt={attributes.imageAlt} style={{ maxWidth: '100%' }} />
      ) : (
        <div style={{ padding: '20px', border: '1px dashed #ccc' }}>
          {__('No image selected', 'cwicly')}
        </div>
      )}
    </div>
  );
}
