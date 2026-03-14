import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({
    className: 'cwicly-container-placeholder',
  });

  return (
    <div {...blockProps}>
      <p>{__('Cwicly Container Placeholder', 'cwicly')}</p>
      <InnerBlocks />
    </div>
  );
}
