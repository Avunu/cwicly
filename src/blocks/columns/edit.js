import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Placeholder Edit component. 
 * In a full reconstruction, this would include all the inspector controls
 * extracted from the monolithic `hp` component.
 */
export default function Edit() {
  const blockProps = useBlockProps({
    className: 'cwicly-columns-placeholder',
  });

  return (
    <div {...blockProps}>
      <p>{__('Cwicly Columns Placeholder', 'cwicly')}</p>
      <InnerBlocks />
    </div>
  );
}
