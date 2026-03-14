import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({
    className: 'cwicly-column-placeholder',
  });

  return (
    <div {...blockProps}>
      <p>{__('Cwicly Column Placeholder', 'cwicly')}</p>
      <InnerBlocks />
    </div>
  );
}
