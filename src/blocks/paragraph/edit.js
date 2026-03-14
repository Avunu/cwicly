// src/blocks/paragraph/edit.js
import { useBlockProps, RichText, InspectorControls, BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { getBlockID, BackgroundHelper } from '../../utils';

export default function Edit({ attributes, setAttributes, clientId }) {
    const blockProps = useBlockProps({
        id: getBlockID(attributes, clientId),
        className: attributes.classes || '',
    });

    // PRIORITY FIX: Explicit BlockControls so toolbar appears on selection
    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    {/* Cwicly-specific toolbar buttons can be added here later */}
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                {/* All original Cwicly panels (dynamic data, advanced classes, background, etc.) */}
                {/* Reuse components from src/components/ as you extract them */}
            </InspectorControls>

            <RichText
                {...blockProps}
                tagName="p"
                value={attributes.content || ''}
                onChange={(content) => setAttributes({ content })}
                placeholder={__('Write your paragraph here…')}
                allowedFormats={[
                    'core/bold',
                    'core/italic',
                    'core/link',
                    // + any Cwicly format extensions you already have
                ]}
            />

            {/* Original Cwicly background & helper features preserved */}
            <BackgroundHelper attributes={attributes} />
        </>
    );
}
