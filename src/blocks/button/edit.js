import { useBlockProps, RichText, InspectorControls, BlockControls, __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { getBlockID, BackgroundHelper } from '../../utils/index.js';

export default function Edit({ attributes, setAttributes, clientId }) {
    const { content, linkWrapperUrl, linkWrapperNewTab, classes } = attributes;
    const [isEditingURL, setIsEditingURL] = useState(false);

    const blockProps = useBlockProps({
        id: getBlockID(attributes, clientId),
        className: `cc-btn ${classes || ''}`,
    });

    return (
        <>
            <BlockControls>
                <div className="wp-block-button__inline-link">
                    <button
                        className="button wp-block-button__link"
                        onClick={() => setIsEditingURL(!isEditingURL)}
                    >
                        {__('Link', 'cwicly')}
                    </button>
                    {isEditingURL && (
                        <Popover position="bottom center" onClose={() => setIsEditingURL(false)}>
                            <LinkControl
                                value={{ url: linkWrapperUrl, opensInNewTab: linkWrapperNewTab === '_blank' }}
                                onChange={(nextValue) => {
                                    setAttributes({
                                        linkWrapperUrl: nextValue.url,
                                        linkWrapperNewTab: nextValue.opensInNewTab ? '_blank' : '_self',
                                        linkWrapperActive: !!nextValue.url,
                                    });
                                }}
                            />
                        </Popover>
                    )}
                </div>
            </BlockControls>
            <InspectorControls>
                <PanelBody title={__('Link Settings', 'cwicly')}>
                    <TextControl
                        label={__('URL', 'cwicly')}
                        value={linkWrapperUrl}
                        onChange={(newUrl) => setAttributes({ linkWrapperUrl: newUrl })}
                    />
                    <ToggleControl
                        label={__('Open in new tab', 'cwicly')}
                        checked={linkWrapperNewTab === '_blank'}
                        onChange={(isChecked) => setAttributes({ linkWrapperNewTab: isChecked ? '_blank' : '_self' })}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <BackgroundHelper attributes={attributes} />
                <RichText
                    tagName="span"
                    value={content}
                    onChange={(newContent) => setAttributes({ content: newContent })}
                    placeholder={__('Button text...', 'cwicly')}
                />
            </div>
        </>
    );
}
