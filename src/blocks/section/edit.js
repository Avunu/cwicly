import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({
    className: 'cwicly-section-placeholder',
  });

  return (
    <section {...blockProps}>
      <p>{__('Cwicly Section Placeholder', 'cwicly')}</p>
      <InnerBlocks />
    </section>
  );
}
