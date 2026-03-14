/**
 * Semantic replacement for image attributes helper.
 */
export function getImageAttributes(attributes) {
  const imageAttrs = {};
  let fallbackValue = "false";
  
  if (attributes.dynamicStaticFallbackID) {
    fallbackValue = attributes.dynamicStaticFallbackID;
  } else if (attributes.dynamicStaticFallbackURL) {
    fallbackValue = attributes.dynamicStaticFallbackURL;
  }

  let size = false;
  if (attributes.imageThumbnailSize) {
    size = attributes.imageThumbnailSize;
  }
  if (attributes.lightbox) {
    size = "full";
  }

  const disableSrcSet = !!attributes.imageDisableSrcSet;
  const config = [
    size || "0",
    attributes.imageAlt ? "0" : "1",
    disableSrcSet ? "0" : "1",
    "image"
  ];

  if (attributes.imageType === "static") {
    if (attributes.imageID && attributes.imageURL) {
      imageAttrs.src = size ? `{imagesrc=${attributes.imageID}=${size}}` : attributes.imageURL;
      if (!disableSrcSet) {
        imageAttrs.srcset = `{imageset=${attributes.imageID}}`;
        imageAttrs.sizes = `{imagesizes=${attributes.imageID}=${size}}`;
      }
      imageAttrs.width = size ? `{imagewidth=${attributes.imageID}=${size}}` : `{imagewidth=${attributes.imageID}}`;
      imageAttrs.height = size ? `{imageheight=${attributes.imageID}=${size}}` : `{imageheight=${attributes.imageID}}`;
    } else if (attributes.imageURL) {
      imageAttrs.src = attributes.imageURL;
    }
  } else if (attributes.imageType === "dynamic" && attributes.dynamic) {
    if (attributes.dynamic === "wordpress" && attributes.dynamicWordpressType) {
      switch (attributes.dynamicWordpressType) {
        case "featuredimage":
          imageAttrs.src = `{featuredimage=true=${size}=${disableSrcSet}=${attributes.imageAlt ? "false" : "true"}=${fallbackValue}}`;
          break;
        case "authorpicture":
          imageAttrs.src = "{authorpicture}";
          break;
        case "userpicture":
          imageAttrs.src = "{userpicture}";
          break;
        case "attachmenturl":
          imageAttrs.src = size ? `{imagesrc=attachment=${size}}` : "{imagesrc=attachment}";
          if (!disableSrcSet) {
            imageAttrs.srcset = "{imageset=attachment}";
            imageAttrs.sizes = `{imagesizes=attachment=${size}}`;
          }
          imageAttrs.width = "{imagewidth=attachment}";
          imageAttrs.height = "{imageheight=attachment}";
          break;
      }
    } else if (attributes.dynamic === "woocommerce" && attributes.dynamicWordpressType) {
      switch (attributes.dynamicWordpressType) {
        case "categorythumbnail":
          imageAttrs.src = `{woocategorythumbnail=${size}}`;
          imageAttrs.srcset = "{woocategorythumbnailsrcset}";
          imageAttrs.sizes = `{woocategorythumbnailsizes=${size}}`;
          break;
        case "cartthumbnail":
          imageAttrs.src = "{cartthumbnail}";
          imageAttrs.srcset = "{cartthumbnailsrcset}";
          break;
        case "wooimage":
          imageAttrs.src = "{wooimage}";
          break;
        case "woogallery":
          imageAttrs.src = size ? `{imagesrc=woogallery=${size}}` : "{imagesrc=woogallery}";
          if (!disableSrcSet) {
            imageAttrs.srcset = "{imageset=woogallery}";
            imageAttrs.sizes = `{imagesizes=woogallery=${size}}`;
          }
          imageAttrs.width = "{imagewidth=woogallery}";
          imageAttrs.height = "{imageheight=woogallery}";
          break;
      }
    } else if (attributes.dynamic === "acf" && attributes.dynamicACFGroup && attributes.dynamicACFField) {
      let locationId = "false";
      if (attributes.dynamicACFFieldLocation) {
        const loc = attributes.dynamicACFFieldLocation;
        if (loc === "postid" && attributes.dynamicACFFieldLocationID) {
          locationId = attributes.dynamicACFFieldLocationID;
        } else if (loc === "currentuser") {
          locationId = "currentuser";
        } else if (loc === "currentauthor") {
          locationId = "currentauthor";
        } else if (loc === "userid" && attributes.dynamicACFFieldLocationID) {
          locationId = `user_${attributes.dynamicACFFieldLocationID}`;
        } else if (loc === "option") {
          locationId = "option";
        } else if (loc === "termid") {
          locationId = "taxterm";
        } else if (loc === "termquery") {
          locationId = "termquery";
        } else if (loc === "userquery") {
          locationId = "userquery";
        } else if (loc === "currenttaxonomytermarchive") {
          locationId = "currenttaxonomytermarchive";
        } else if (loc === "taxonomyterm" && attributes.dynamicACFFieldLocationIDObject?.value) {
          locationId = `term_${attributes.dynamicACFFieldLocationIDObject.value}`;
        }
      }
      imageAttrs.src = `{acffield=${attributes.dynamicACFField}=${locationId}=${attributes.dynamicACFFieldPlus || "false"}=${fallbackValue}=${config.join("-")}}`;
    } else if (attributes.dynamic === "repeater" && attributes.dynamicACFField) {
      imageAttrs.src = `{acfrepeater=${attributes.dynamicACFField}=${fallbackValue}=${attributes.dynamicACFFieldPlus || "false"}=${config.join("-")}}`;
    } else if (attributes.dynamic === "commentquery" && attributes.dynamicWordpressType) {
      imageAttrs.src = `{commentquery=${attributes.dynamicWordpressType}=${fallbackValue}}`;
    }
  }

  if (!imageAttrs.src) {
    imageAttrs.src = `${window.cwicly_info?.plugin || ''}assets/images/placeholder.jpg`;
  }

  // Handle Alt Text
  if (attributes.imageAlt) {
    if (attributes.imageAlt.includes("!ref=")) {
      imageAttrs.alt = `{component=parameter=${attributes.imageAlt.replace(/!ref=([\w-]+)!/, "$1")}}`;
    } else {
      imageAttrs.alt = attributes.imageAlt;
    }
  } else if (attributes.imageID) {
    imageAttrs.alt = `{imagealt=${attributes.imageID}}`;
  } else if (attributes.dynamicWordpressType === "woogallery") {
    imageAttrs.alt = "{imagealt=woogallery}";
  } else if (attributes.dynamicWordpressType === "attachmenturl") {
    imageAttrs.alt = "{imagealt=attachment}";
  } else {
    imageAttrs.alt = "";
  }

  // Handle Lazy Loading
  if (attributes.lazyLoadComp) {
    imageAttrs.loading = `{component=parameter=${attributes.lazyLoadComp.replace(/!ref=([\w-]+)!/, "$1")}}`;
  } else if (attributes.lazyLoad !== undefined && attributes.lazyLoad !== null && attributes.lazyLoad !== "") {
    imageAttrs.loading = attributes.lazyLoad ? "lazy" : "eager";
  }

  // Handle Component Connectors
  if (!imageAttrs.src && attributes.componentConnectors?.image?.ref) {
    imageAttrs.src = `{component=image=${attributes.componentConnectors.image.ref}}`;
    if (attributes.lazyLoadComp) {
      imageAttrs.loading = `{component=parameter=${attributes.lazyLoadComp.replace(/!ref=([\w-]+)!/, "$1")}}`;
    }
    if (attributes.imageAlt) {
      imageAttrs.alt = attributes.imageAlt.includes("!ref=") ? 
        `{component=parameter=${attributes.imageAlt.replace(/!ref=([\w-]+)!/, "$1")}}` : attributes.imageAlt;
    }
  }

  return imageAttrs;
}
