import { useBlockProps, InspectorControls, BlockControls, MediaPlaceholder, MediaUpload, MediaUploadCheck, __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { PanelBody, TextareaControl, Button, ToolbarGroup, ToolbarButton, ToggleControl, TextControl, Popover, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { getBlockID, BackgroundHelper } from '../../utils/index.js';

export default function Edit({ attributes, setAttributes, clientId }) {
    const { 
        imageURL, 
        imageID, 
        imageAlt, 
        classes, 
        imageLightbox,
        linkWrapperActive,
        linkWrapperUrl,
        linkWrapperNewTab,
        imageThumbnailSize
    } = attributes;

    const [isEditingURL, setIsEditingURL] = useState(false);

    const blockProps = useBlockProps({
        id: getBlockID(attributes, clientId),
        className: classes || '',
    });

    const onSelectImage = (media) => {
        setAttributes({
            imageURL: media.url,
            imageID: media.id,
            imageAlt: media.alt,
        });
    };

    const removeImage = () => {
        setAttributes({
            imageURL: undefined,
            imageID: undefined,
            imageAlt: '',
        });
    };

    return (
        <>
            <BlockControls>
                {imageURL && (
                    <ToolbarGroup>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectImage}
                                allowedTypes={['image']}
                                value={imageID}
                                render={({ open }) => (
                                    <ToolbarButton
                                        onClick={open}
                                        icon="edit"
                                        label={__('Replace Image', 'cwicly')}
                                    />
                                )}
                            />
                        </MediaUploadCheck>
                    </ToolbarGroup>
                )}
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
                <PanelBody title={__('Image Settings', 'cwicly')}>
                    <SelectControl
                        label={__('Size', 'cwicly')}
                        value={imageThumbnailSize}
                        options={[
                            { label: __('Full', 'cwicly'), value: 'full' },
                            { label: __('Large', 'cwicly'), value: 'large' },
                            { label: __('Medium', 'cwicly'), value: 'medium' },
                            { label: __('Thumbnail', 'cwicly'), value: 'thumbnail' },
                        ]}
                        onChange={(val) => setAttributes({ imageThumbnailSize: val })}
                    />
                    <TextareaControl
                        label={__('Alternative Text', 'cwicly')}
                        value={imageAlt}
                        onChange={(newAlt) => setAttributes({ imageAlt: newAlt })}
                        help={__('Describe the purpose of the image for accessibility.', 'cwicly')}
                    />
                    <ToggleControl
                        label={__('Lightbox', 'cwicly')}
                        checked={imageLightbox}
                        onChange={(val) => setAttributes({ imageLightbox: val })}
                    />
                    {imageURL && (
                        <Button isDestructive onClick={removeImage}>
                            {__('Remove Image', 'cwicly')}
                        </Button>
                    )}
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
                {imageURL ? (
                    <img src={imageURL} alt={imageAlt} />
                ) : (
                    <MediaPlaceholder
                        onSelect={onSelectImage}
                        allowedTypes={['image']}
                        multiple={false}
                        labels={{ title: __('Cwicly Image', 'cwicly') }}
                    />
                )}
            </div>
        </>
    );
}
