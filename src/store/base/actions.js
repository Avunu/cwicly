/**
 * Cwicly Base Actions
 */
import { select } from '@wordpress/data';

export const writeDesignSearch = (value) => ({
  type: "CC_DESIGN_SEARCH",
  writeDesignSearch: value
});

export const writePreviewDeviceType = (value) => ({
  type: "CC_PREVIEW_DEVICE_TYPE",
  writePreviewDeviceType: value
});

export const writeGlobalDarkMode = (value) => ({
  type: "CC_GLOBAL_DARK_MODE",
  writeGlobalDarkMode: value
});

export const writeDarkModeSelectors = (value) => ({
  type: "CC_DARK_MODE_SELECTORS",
  writeDarkModeSelectors: value
});

export const writeNavRelativeStyles = (value) => ({
  type: "CC_NAV_RELATIVE_STYLES",
  writeNavRelativeStyles: value
});

export const writeHoveredBlock = (value) => ({
  type: "CC_HOVERED_BLOCK",
  writeHoveredBlock: value
});

export const writeComponents = (value) => ({
  type: "CC_COMPONENTS",
  writeComponents: value
});

export const writeComponentVariants = (value) => ({
  type: "CC_COMPONENTS_VARIANTS",
  writeComponentVariants: value
});

export const writeSingleComponents = (value) => ({
  type: "CC_COMPONENTS_SINGLE",
  writeSingleComponents: value
});

export const writeTailwindClasses = (value) => ({
  type: "CC_TAILWIND_CLASSES",
  writeTailwindClasses: value
});

export const writeClassPreview = (value) => ({
  type: "CC_CLASS_PREVIEW",
  writeClassPreview: value
});

export const writeNavigation = (value) => ({
  type: "CC_NAVIGATION",
  writeNavigation: value
});

export const writeClasses = (classes, useExisting = true, isInternal = false) => {
  if (isInternal) {
    // In a full implementation, sb(classes) would be called here
    return {
      type: "CC_CLASSES",
      writeClasses: classes
    };
  }
  let finalClasses = classes;
  if (useExisting) {
    const existing = select("cwicly/base").getClasses();
    finalClasses = { ...existing };
    finalClasses[classes.uniqueID] = {
      classID: classes.classID,
      clientId: classes.clientId
    };
  }
  return {
    type: "CC_CLASSES",
    writeClasses: finalClasses
  };
};

export const writeInspectorWidth = (value) => ({
  type: "CC_INSPECTOR_WIDTH",
  writeInspectorWidth: value
});

export const writeInspectorHeight = (value) => ({
  type: "CC_INSPECTOR_HEIGHT",
  writeInspectorHeight: value
});

export const writePopoverRefs = (value) => ({
  type: "CC_POPOVER_REFS",
  writePopoverRefs: value
});

export const writePopoverRefsPrep = (value) => ({
  type: "CC_POPOVER_REFS_PREP",
  writePopoverRefsPrep: value
});

export const writeInstances = (value) => ({
  type: "CC_INSTANCES",
  writeInstances: value
});

export const writeSaveDesignLibrary = (value) => ({
  type: "CC_SAVE_DESIGN_LIBRARY",
  writeSaveDesignLibrary: value
});

export const writeComponentLibraryOpen = (value) => ({
  type: "CC_COMPONENT_LIBRARY_OPEN",
  writeComponentLibraryOpen: value
});

export const writeDesignLibraryOpen = (value) => ({
  type: "CC_DESIGN_LIBRARY_OPEN",
  writeDesignLibraryOpen: value
});

export const writeGlobalActiveStyle = (value) => ({
  type: "CC_GLOBAL_ACTIVE_STYLE",
  writeGlobalActiveStyle: value
});

export const writeGlobalFonts = (value) => ({
  type: "CC_GLOBAL_FONTS",
  writeGlobalFonts: value
});

export const writeNewBlocks = (value) => ({
  type: "CC_NEW_BLOCKS",
  writeNewBlocks: value
});

export const writePrevDevice = (value) => ({
  type: "CC_PREV_DEVICE",
  writePrevDevice: value
});

export const writePrevGlobalCount = (value) => ({
  type: "CC_PREV_GLOBAL_COUNT",
  writePrevGlobalCount: value
});

export const writeGlobalClassesBlockEdit = (value) => ({
  type: "CC_GLOBAL_CLASSES_BLOCK_EDIT",
  writeGlobalClassesBlockEdit: value
});

export const writeShellEdit = (value) => ({
  type: "CC_SHELL_EDIT",
  writeShellEdit: value
});

export const writeExternalClasses = (classes, skipDb = false) => {
  if (!skipDb) {
    // In a full implementation, db(classes) would be called here
  }
  return {
    type: "CC_EXTERNAL_CLASSES",
    writeExternalClasses: classes
  };
};

export const writeRoleEditor = (value) => ({
  type: "CC_ROLE_EDITOR",
  writeRoleEditor: value
});

export const writeNavigatorHeight = (value) => ({
  type: "CC_NAVIGATOR_HEIGHT",
  writeNavigatorHeight: value
});

export const writePostTemplateSize = (value) => ({
  type: "CC_POST_TEMPLATE_SIZE",
  writePostTemplateSize: value
});

export const writeTabsState = (value) => ({
  type: "CC_TABS_STATE",
  writeTabsState: value
});

export const writeInserterState = (value) => ({
  type: "CC_INSERTER_STATE",
  writeInserterState: value
});

export const writePrimaryTab = (value) => ({
  type: "CC_PRIMARY_TAB",
  writePrimaryTab: value
});

export const writeInspectorWindowPosition = (value) => ({
  type: "CC_WINDOW_INSPECTOR_POSITION",
  writeInspectorWindowPosition: value
});

export const writeAllImageSizes = (value) => ({
  type: "CC_ALL_IMAGE_SIZES",
  writeAllImageSizes: value
});

export const writeCopyLinked = (value) => ({
  type: "CC_COPY_LINKED",
  writeCopyLinked: value
});

export const writeGlobalParts = (value) => ({
  type: "CC_GLOBAL_PARTS",
  writeGlobalParts: value
});

export const writePostsPerPage = (value) => ({
  type: "CC_POSTS_PER_PAGE",
  writePostsPerPage: value
});

export const writeAltKey = (value) => ({
  type: "CC_ALTKEY",
  writeAltKey: value
});

export const writeSaveGlobalStylesheet = (value) => ({
  type: "CC_SAVE_GLOBAL_STYLESHEET",
  writeSaveGlobalStylesheet: value
});

export const writeSectionDefaults = (value) => ({
  type: "CC_SECTION_DEFAULT",
  writeSectionDefaults: value
});

export const writeAdditionalClassesBool = (value) => ({
  type: "CC_ADDITIONAL_CLASSES_BOOL",
  writeAdditionalClassesBool: value
});

export const writeHideModals = (value) => ({
  type: "CC_HIDEMODALS",
  writeHideModals: value
});

export const writeIsResolving = (value) => {
  const resolving = select("cwicly/base").getIsResolving();
  const index = resolving.indexOf(value);
  const newResolving = [...resolving];
  if (index !== -1) {
    newResolving.splice(index, 1);
  } else {
    newResolving.push(value);
  }
  return {
    type: "CC_IS_RESOLVING",
    writeIsResolving: newResolving
  };
};

export const writeWooAttributes = (value) => ({
  type: "CC_WOO_ATTRIBUTES",
  writeWooAttributes: value
});

export const writeWooAttributesTerms = (value) => ({
  type: "CC_WOO_ATTRIBUTES_TERMS",
  writeWooAttributesTerms: value
});

export const writeWooProductTypes = (value) => ({
  type: "CC_WOO_PRODUCT_TYPES",
  writeWooProductTypes: value
});

export const writeWooTaxClasses = (value) => ({
  type: "CC_WOO_TAX_CLASSES",
  writeWooTaxClasses: value
});

export const writeWooShippingClasses = (value) => ({
  type: "CC_WOO_SHIPPING_CLASSES",
  writeWooShippingClasses: value
});

export const writeWooProducts = (value) => ({
  type: "CC_WOO_PRODUCTS",
  writeWooProducts: value
});

export const writeGoogleFonts = (value) => ({
  type: "CC_GOOGLE_FONTS",
  writeGoogleFonts: value
});

export const writeUserCapabilities = (value) => ({
  type: "CC_USER_CAPABILITIES",
  writeUserCapabilities: value
});

export const writeUserRoles = (value) => ({
  type: "CC_USER_ROLES",
  writeUserRoles: value
});

export const writeHideHooks = (value) => ({
  type: "CC_HIDEHOOKS",
  writeHideHooks: value
});

export const writeDarkMode = (value) => ({
  type: "CC_DARKMODE",
  writeDarkMode: value
});

export const writePseudoClass = (value) => ({
  type: "CC_PSEUDOCLASS",
  writePseudoClass: value
});

export const writeGlobalStylesheets = (value) => ({
  type: "CC_GLOBAL_STYLESHEETS",
  writeGlobalStylesheets: value
});

export const writeGlobalInteractions = (value) => ({
  type: "CC_GLOBAL_INTERACTIONS",
  writeGlobalInteractions: value
});

export const writeInspectorPosition = (value) => ({
  type: "CC_INSPECTOR_POSITION",
  writeInspectorPosition: value
});

export const writeGlobalClasses = (value) => ({
  type: "CC_GLOBAL_CLASSES",
  writeGlobalClasses: value
});

export const writeGlobalClassesRendered = (value) => ({
  type: "CC_GLOBAL_CLASSES_RENDERED",
  writeGlobalClassesRendered: value
});

export const writeSelectedGlobalClass = (value) => ({
  type: "CC_SELECTED_GLOBAL_CLASS",
  writeSelectedGlobalClass: value
});

export const writeLocalFonts = (value) => ({
  type: "CC_LOCAL_FONTS",
  writeLocalFonts: value
});

export const writeLocalActiveFonts = (value) => ({
  type: "CC_LOCAL_ACTIVE_FONTS",
  writeLocalActiveFonts: value
});

export const writeHeartbeat = (value) => ({
  type: "CC_HEARTBEAT",
  writeHeartbeat: value
});

export const writeComponentsFolders = (value) => ({
  type: "CC_COMPONENTS_FOLDERS",
  writeComponentsFolders: value
});
