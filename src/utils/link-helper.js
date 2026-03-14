/**
 * Semantic replacement for link attributes helper.
 */
export function getLinkAttributes(attributes, blockType = "") {
  const linkAttrs = {};
  
  if (!attributes?.linkWrapperActive) {
    if (attributes?.componentConnectors?.link?.ref) {
      return {
        href: `{component=link=${attributes.componentConnectors.link.ref}}`
      };
    }
    return null;
  }

  let rel = attributes.linkWrapperRel || "";
  let title = attributes.linkWrapperTitle || "";
  let ariaLabel = attributes.linkWrapperAriaLabel || "";
  let target = "";

  if (attributes.linkWrapperNewTab) {
    target = "_blank";
    if (rel) {
      if (!rel.includes("noopener")) {
        rel = `${rel} noopener`;
      }
    } else {
      rel = "noopener";
    }
  }

  if (attributes.linkWrapperType === "action") {
    const action = attributes.linkWrapperAction;
    
    // Popover Actions
    if (attributes.linkWrapperActionPopoverID) {
      switch (action) {
        case "showPopover":
          linkAttrs["data-show-popover"] = attributes.linkWrapperActionPopoverID;
          break;
        case "hidePopover":
          linkAttrs["data-hide-popover"] = attributes.linkWrapperActionPopoverID;
          break;
        case "showHidePopover":
          linkAttrs["data-showhide-popover"] = attributes.linkWrapperActionPopoverID;
          if (attributes.linkWrapperActionExtra?.in) {
            linkAttrs["data-popover-delay"] = parseFloat(attributes.linkWrapperActionExtra.in);
            linkAttrs["data-popover-delayOut"] = parseFloat(attributes.linkWrapperActionExtra.out);
          }
          break;
        case "togglePopover":
          linkAttrs["data-toggle-popover"] = attributes.linkWrapperActionPopoverID;
          break;
      }
      linkAttrs["data-ccp-state"] = "closed";
    }

    // Nav Actions
    if (attributes.linkWrapperActionNavID) {
      switch (action) {
        case "showNav":
          linkAttrs["data-show-nav"] = attributes.linkWrapperActionNavID;
          linkAttrs["is-open"] = "false";
          break;
        case "hideNav":
          linkAttrs["data-close-nav"] = attributes.linkWrapperActionNavID;
          linkAttrs["is-open"] = "false";
          break;
        case "toggleNav":
          linkAttrs["data-toggle-nav"] = attributes.linkWrapperActionNavID;
          linkAttrs["is-open"] = "false";
          break;
      }
    }

    // Scroll Actions
    if (action === "scrolltotop") {
      linkAttrs["data-scrolltotop"] = "";
      if (attributes.linkWrapperActionExtra?.offset) linkAttrs["data-offset"] = attributes.linkWrapperActionExtra.offset;
      if (attributes.linkWrapperActionExtra?.outoffset) linkAttrs["data-offset-out"] = attributes.linkWrapperActionExtra.outoffset;
      if (attributes.linkWrapperActionExtra?.intarget) linkAttrs["data-target-in"] = attributes.linkWrapperActionExtra.intarget;
      if (attributes.linkWrapperActionExtra?.outtarget) linkAttrs["data-target-out"] = attributes.linkWrapperActionExtra.outtarget;
    } else if (action === "toggleDarkMode") {
      linkAttrs["data-action"] = "dark-mode";
      linkAttrs["aria-label"] = "Toggle Dark Mode";
    } else if (action === "wooaddtocart") {
      linkAttrs["data-cc-add-to-cart"] = "";
    } else if (action === "wooresetselection") {
      linkAttrs["data-cc-woo-reset"] = "";
    } else if (action === "share") {
      const shareDesc = attributes.linkWrapperShareDescription || "";
      const shareType = attributes.linkWrapperShare;
      switch (shareType) {
        case "twitter": linkAttrs.href = `https://twitter.com/intent/tweet?url={pageurl}&text=${shareDesc}`; break;
        case "facebook": linkAttrs.href = "https://www.facebook.com/sharer.php?u={pageurl}"; break;
        case "linkedin": linkAttrs.href = `https://www.linkedin.com/shareArticle?url={pageurl}&title=${shareDesc}`; break;
        case "email": 
          const email = attributes.linkWrapperActionContactEmailAddress || "";
          linkAttrs.href = `mailto:${email}?subject=${shareDesc}&body={pageurl=false=encoded}`;
          break;
        case "pinterest": linkAttrs.href = `https://www.pinterest.com/pin/create/button?url={pageurl}&media=&description=${shareDesc}`; break;
        case "reddit": linkAttrs.href = `https://reddit.com/submit?url={pageurl}&title=${shareDesc}`; break;
        case "whatsapp": linkAttrs.href = "https://wa.me/?text={pageurl}"; break;
        case "sms": linkAttrs.href = "sms:%7Bphone_number%7D?body={pageurl}"; break;
        case "stumbleupon": linkAttrs.href = `https://www.stumbleupon.com/submit?url={pageurl}&title=${shareDesc}`; break;
      }
    } else if (action === "nextQuery") {
      linkAttrs.href = "{nextquery}";
    } else if (action === "prevQuery") {
      linkAttrs.href = "{prevquery}";
    } else if (action === "contact") {
      const contactType = attributes.linkWrapperActionContactType;
      const oneLine = attributes.linkWrapperActionContactOneLine || "";
      switch (contactType) {
        case "email":
          const emailAddr = attributes.linkWrapperActionContactEmailAddress || "";
          const subject = attributes.linkWrapperActionContactEmailSubject || "";
          const msg = attributes.linkWrapperActionContactEmailMessage || "";
          linkAttrs.href = `mailto:${emailAddr}?subject=${subject}&body=${msg}`;
          break;
        case "tel": linkAttrs.href = `tel:${oneLine}`; break;
        case "sms": linkAttrs.href = `sms:${oneLine}`; break;
        case "whatsapp": linkAttrs.href = `https://api.whatsapp.com/send?phone=${oneLine}`; break;
        case "messenger": linkAttrs.href = `https://m.me/${oneLine}`; break;
        case "viber": linkAttrs.href = `viber://${attributes.linkWrapperActionContactViber}?number=${oneLine}`; break;
        case "skype": linkAttrs.href = `skype:${oneLine}?${attributes.linkWrapperActionContactSkype}`; break;
        case "waze": linkAttrs.href = `https://www.waze.com/ul?ll=${oneLine}`; break;
        case "googlecalendar":
          let dates = "";
          if (attributes.linkWrapperActionContactCalendarStart && !attributes.linkWrapperActionContactCalendarEnd) {
            dates = `&dates=${attributes.linkWrapperActionContactCalendarStart.replace(/[^A-Za-z0-9]/, "")}`;
          } else if (attributes.linkWrapperActionContactCalendarStart && attributes.linkWrapperActionContactCalendarEnd) {
            dates = `&dates=${attributes.linkWrapperActionContactCalendarStart.replace(/[^A-Za-z0-9]/, "")}/${attributes.linkWrapperActionContactCalendarEnd.replace(/[^A-Za-z0-9]/, "")}`;
          }
          const loc = attributes.linkWrapperActionContactCalendarLocation ? `&location=${attributes.linkWrapperActionContactCalendarLocation}` : "";
          const details = attributes.linkWrapperActionContactCalendarDescription ? `&details=${attributes.linkWrapperActionContactCalendarDescription}` : "";
          const text = attributes.linkWrapperActionContactCalendarTitle ? `&text=${attributes.linkWrapperActionContactCalendarTitle}` : "";
          linkAttrs.href = `https://www.google.com/calendar/render?action=TEMPLATE${text}${details}${dates}${loc}`;
          break;
      }
    } else if (action === "slider" && attributes.linkWrapperActionSliderType && attributes.linkWrapperActionSliderID) {
      if (attributes.linkWrapperActionSliderType === "gotoindex" && attributes.linkWrapperActionSliderGoTo !== null) {
        linkAttrs["data-gotoindex"] = attributes.linkWrapperActionSliderGoTo;
      }
      linkAttrs["data-slidernav"] = "";
      linkAttrs["data-slidertype"] = attributes.linkWrapperActionSliderType;
      linkAttrs["data-sliderid"] = attributes.linkWrapperActionSliderID;
    } else if (action === "lightbox") {
      // Lightbox logic (simplified for extraction)
      linkAttrs["data-lightbox"] = "";
      if (attributes.linkWrapperActionLighboxRef) linkAttrs["data-gallery"] = attributes.linkWrapperActionLighboxRef;
      // ... more lightbox details can be added here
    } else if (action === "modal" && attributes.linkWrapperActionModalType) {
      const type = attributes.linkWrapperActionModalType;
      const blockId = attributes.linkWrapperActionModalBlockId;
      if (blockId) {
        linkAttrs[`data-modal${type === 'open' ? '' : type}`] = "";
        linkAttrs["data-modalid"] = blockId; // Vo function likely just returns the ID
      }
    }
  } else if (attributes.linkWrapperType === "url") {
    if (attributes.linkWrapperSourceType === "dynamic") {
      // Handle dynamic URL tags
      switch (attributes.linkWrapperSourceDynamic) {
        case "posturl": linkAttrs.href = "{pageurl}"; break;
        case "attachmenturl": linkAttrs.href = "{attachment_url}"; break;
        case "featuredimage": linkAttrs.href = "{featuredimage}"; break;
        case "homeurl": linkAttrs.href = "{homeurl}"; break;
        // ... more dynamic sources
      }
    } else if (attributes.linkWrapperSourceType === "static") {
      linkAttrs.href = attributes.linkWrapperUrl || "";
    }
  }

  if (linkAttrs.href || Object.keys(linkAttrs).length > 0) {
    if (rel) linkAttrs.rel = rel;
    if (target) linkAttrs.target = target;
    if (title) linkAttrs.title = title;
    if (ariaLabel) linkAttrs["aria-label"] = ariaLabel;
    return linkAttrs;
  }

  return null;
}
