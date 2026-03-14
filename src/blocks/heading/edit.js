import { useBlockProps, RichText, InspectorControls, BlockControls, __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, PanelBody, SelectControl, ToggleControl, TextControl, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { getBlockID, BackgroundHelper } from '../../utils/index.js';

export default function Edit({ attributes, setAttributes, clientId }) {
    const { 
        content, 
        headingTag, 
        classes, 
        linkWrapperActive, 
        linkWrapperUrl, 
        linkWrapperNewTab 
    } = attributes;
    
    const [isEditingURL, setIsEditingURL] = useState(false);

    const blockProps = useBlockProps({
        id: getBlockID(attributes, clientId),
        className: classes || '',
    });

    const setHeadingTag = (tag) => {
        setAttributes({ headingTag: tag });
    };

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                        <ToolbarButton
                            key={level}
                            icon={`heading`}
                            label={__(`Heading ${level}`, 'cwicly')}
                            isActive={headingTag === `h${level}`}
                            onClick={() => setHeadingTag(`h${level}`)}
                        >
                            {level}
                        </ToolbarButton>
                    ))}
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarButton
                        icon="admin-links"
                        label={__('Link', 'cwicly')}
                        onClick={() => setIsEditingURL(!isEditingURL)}
                        isActive={linkWrapperActive}
                    />
                </ToolbarGroup>
            </BlockControls>
            {isEditingURL && (
                <Popover position="bottom center" onClose={() => setIsEditingURL(false)}>
                    <LinkControl
                        value={{ url: linkWrapperUrl, opensInNewTab: linkWrapperNewTab }}
                        onChange={(nextValue) => {
                            setAttributes({
                                linkWrapperUrl: nextValue.url,
                                linkWrapperNewTab: nextValue.opensInNewTab,
                                linkWrapperActive: !!nextValue.url,
                            });
                        }}
                    />
                </Popover>
            )}
            <InspectorControls>
                <PanelBody title={__('Heading Settings', 'cwicly')}>
                    <SelectControl
                        label={__('Tag', 'cwicly')}
                        value={headingTag}
                        options={[
                            { label: 'H1', value: 'h1' },
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                            { label: 'H4', value: 'h4' },
                            { label: 'H5', value: 'h5' },
                            { label: 'H6', value: 'h6' },
                        ]}
                        onChange={setHeadingTag}
                    />
                </PanelBody>
                <PanelBody title={__('Link Settings', 'cwicly')}>
                    <ToggleControl
                        label={__('Link active', 'cwicly')}
                        checked={linkWrapperActive}
                        onChange={(val) => setAttributes({ linkWrapperActive: val })}
                    />
                    {linkWrapperActive && (
                        <>
                            <TextControl
                                label={__('URL', 'cwicly')}
                                value={linkWrapperUrl}
                                onChange={(val) => setAttributes({ linkWrapperUrl: val })}
                            />
                            <ToggleControl
                                label={__('Open in new tab', 'cwicly')}
                                checked={linkWrapperNewTab}
                                onChange={(val) => setAttributes({ linkWrapperNewTab: val })}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <BackgroundHelper attributes={attributes} />
                <RichText
                    tagName={headingTag || 'h1'}
                    value={content}
                    onChange={(newContent) => setAttributes({ content: newContent })}
                    placeholder={__('Heading content...', 'cwicly')}
                />
            </div>
        </>
    );
}
