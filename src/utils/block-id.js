/**
 * Semantic replacement for the block ID helper.
 */
export function getBlockID(attributes, blockName = "") {
  if (attributes.linkWrapperSourceDynamic === 'commentcancelreply') {
    return 'cancel-comment-reply-link{idadd}';
  }

  // Check if we should remove IDs and classes based on global info
  const removeIDsClasses = window.cwicly_info?.removeIDsClasses === 'true';

  const shouldGenerateID = 
    !removeIDsClasses || 
    ['nav', 'popover', 'querypagination', 'video', 'tabcontents', 'tabcontent', 'tablist', 
     'accordionheader', 'accordions', 'accordion', 'modal', 'slider', 'query', 
     'queryTemplate', 'tab', 'filter', 'querypaginationnumbers'].includes(blockName) ||
    attributes.forceShowID || 
    attributes.repeaterMasonry || 
    (attributes.interactions && attributes.interactions.length) ||
    attributes.dynamicContext === 'woocart';

  if (shouldGenerateID) {
    if (attributes?.componentConnectors?.id?.ref) {
      return `{component=parameter=${attributes.componentConnectors.id.ref}}{idadd}`;
    }
    return `${attributes.id}{idadd}`;
  }

  return null;
}
