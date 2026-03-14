const inserterState = !localStorage.getItem("cwicly-editor-settings") || 
  "false" !== JSON.parse(localStorage.getItem("cwicly-editor-settings")).inserter;

export const INITIAL_STATE = {
  instances: {},
  designLibraryOpen: false,
  saveDesignLibrary: "",
  globalActiveStyle: "",
  globalFonts: "",
  classes: {},
  newBlocks: [],
  prevDevice: {},
  prevGlobalCount: {},
  globalClassesBlockEdit: {},
  shellEdit: {},
  externalClasses: [],
  roleEditor: {},
  navigatorHeight: 0,
  postTemplateSize: false,
  tabsState: {},
  inserterState: inserterState,
  primaryTabPosition: {},
  inspectorWindowPosition: localStorage.getItem("cwicly-window-inspector-position") ? localStorage.getItem("cwicly-window-inspector-position") : "right",
  allImageSizes: {},
  globalParts: {},
  postsPerPage: "",
  copyLinked: "false",
  saveGlobalStylesheet: false,
  sectionDefaults: {},
  additionalClassesBool: false,
  isResolving: [],
  wooProductTypes: {},
  wooAttributes: [],
  wooAttributesTerms: {},
  wooShippingClasses: [],
  wooTaxClasses: [],
  googleFonts: {},
  wooProducts: {},
  userCapabilities: {},
  userRoles: {},
  hideHooks: localStorage.getItem("cwicly-hook-behaviour") ? localStorage.getItem("cwicly-hook-behaviour") : "false",
  globalInteractions: {},
  altKey: false,
  hideModals: localStorage.getItem("cwicly-modal-behaviour") ? localStorage.getItem("cwicly-modal-behaviour") : "false",
  pseudoClass: "",
  darkMode: localStorage.getItem("cwicly-darkmode") ? localStorage.getItem("cwicly-darkmode") : "inherit",
  globalClasses: {},
  globalClassesRendered: {},
  selectedGlobalClass: "",
  globalStylesheets: [],
  inspectorPosition: {
    tab: "primary",
    panel: ""
  },
  popoverRefs: {
    empty: {}
  },
  popoverRefsPrep: [],
  inspectorHeight: false,
  inspectorWidth: false,
  localFonts: {},
  localActiveFonts: [],
  localFontProcessing: false,
  isDownloadingGoogleFont: false,
  heartbeat: {},
  navigation: {},
  navRelativeStyles: {},
  classPreview: {},
  components: {},
  singleComponents: {},
  tailwindClasses: [],
  componentLibraryOpen: false,
  componentVariants: {},
  hoveredBlock: "",
  componentsFolders: [],
  globalDarkMode: false,
  darkModeSelectors: ".dark",
  previewDeviceType: typeof cwicly_info !== 'undefined' && cwicly_info.clientView ? cwicly_info.clientView : (typeof cwicly_info !== 'undefined' ? cwicly_info.mainBreakpoint : 'desktop'),
  designSearch: ""
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "CC_DESIGN_SEARCH":
      return { ...state, designSearch: action.writeDesignSearch };
    case "CC_NAVIGATION":
      return { ...state, navigation: action.writeNavigation };
    case "CC_PREVIEW_DEVICE_TYPE":
      return { ...state, previewDeviceType: action.writePreviewDeviceType };
    case "CC_GLOBAL_DARK_MODE":
      return { ...state, globalDarkMode: action.writeGlobalDarkMode };
    case "CC_DARK_MODE_SELECTORS":
      return { ...state, darkModeSelectors: action.writeDarkModeSelectors };
    case "CC_HOVERED_BLOCK":
      return { ...state, hoveredBlock: action.writeHoveredBlock };
    case "CC_COMPONENTS":
      return { ...state, components: action.writeComponents };
    case "CC_COMPONENTS_VARIANTS":
      return { ...state, componentVariants: action.writeComponentVariants };
    case "CC_TAILWIND_CLASSES":
      return { ...state, tailwindClasses: action.writeTailwindClasses };
    case "CC_COMPONENTS_SINGLE":
      return { ...state, singleComponents: action.writeSingleComponents };
    case "CC_CLASS_PREVIEW":
      return { ...state, classPreview: action.writeClassPreview };
    case "CC_NAV_RELATIVE_STYLES":
      return { ...state, navRelativeStyles: action.writeNavRelativeStyles };
    case "CC_ROLE_EDITOR":
      return { ...state, roleEditor: action.writeRoleEditor };
    case "CC_INSPECTOR_HEIGHT":
      return { ...state, inspectorHeight: action.writeInspectorHeight };
    case "CC_INSPECTOR_WIDTH":
      return { ...state, inspectorWidth: action.writeInspectorWidth };
    case "CC_DOWNLOADING_GOOGLE":
      return { ...state, isDownloadingGoogleFont: action.writeIsDownloadingGoogleFont };
    case "CC_LOCAL_FONT_PROCESSING":
      return { ...state, localFontProcessing: action.writeLocalFontProcessing };
    case "CC_POPOVER_REFS":
      return { ...state, popoverRefs: action.writePopoverRefs };
    case "CC_POPOVER_REFS_PREP":
      return { ...state, popoverRefsPrep: action.writePopoverRefsPrep };
    case "CC_INSTANCES":
      return { ...state, instances: action.writeInstances };
    case "CC_SAVE_DESIGN_LIBRARY":
      return { ...state, saveDesignLibrary: action.writeSaveDesignLibrary };
    case "CC_COMPONENT_LIBRARY_OPEN":
      return { ...state, componentLibraryOpen: action.writeComponentLibraryOpen };
    case "CC_DESIGN_LIBRARY_OPEN":
      return { ...state, designLibraryOpen: action.writeDesignLibraryOpen };
    case "CC_GLOBAL_ACTIVE_STYLE":
      return { ...state, globalActiveStyle: action.writeGlobalActiveStyle };
    case "CC_GLOBAL_FONTS":
      return { ...state, globalFonts: action.writeGlobalFonts };
    case "CC_GLOBAL_CLASSES_BLOCK_EDIT":
      return { ...state, globalClassesBlockEdit: action.writeGlobalClassesBlockEdit };
    case "CC_SHELL_EDIT":
      return { ...state, shellEdit: action.writeShellEdit };
    case "CC_CLASSES":
      return { ...state, classes: action.writeClasses };
    case "CC_NEW_BLOCKS":
      return { ...state, newBlocks: action.writeNewBlocks };
    case "CC_PREV_DEVICE":
      return { ...state, prevDevice: action.writePrevDevice };
    case "CC_PREV_GLOBAL_COUNT":
      return { ...state, prevGlobalCount: action.writePrevGlobalCount };
    case "CC_EXTERNAL_CLASSES":
      return { ...state, externalClasses: action.writeExternalClasses };
    case "CC_NAVIGATOR_HEIGHT":
      return { ...state, navigatorHeight: action.writeNavigatorHeight };
    case "CC_POST_TEMPLATE_SIZE":
      return { ...state, postTemplateSize: action.writePostTemplateSize };
    case "CC_TABS_STATE":
      return { ...state, tabsState: action.writeTabsState };
    case "CC_INSERTER_STATE":
      return { ...state, inserterState: action.writeInserterState };
    case "CC_PRIMARY_TAB":
      return { ...state, primaryTabPosition: action.writePrimaryTab };
    case "CC_POSTS_PER_PAGE":
      return { ...state, postsPerPage: action.writePostsPerPage };
    case "CC_WINDOW_INSPECTOR_POSITION":
      return { ...state, inspectorWindowPosition: action.writeInspectorWindowPosition };
    case "CC_ALL_IMAGE_SIZES":
      return { ...state, allImageSizes: action.writeAllImageSizes };
    case "CC_GLOBAL_PARTS":
      return { ...state, globalParts: action.writeGlobalParts };
    case "CC_COPY_LINKED":
      return { ...state, copyLinked: action.writeCopyLinked };
    case "CC_ADDITIONAL_CLASSES_BOOL":
      return { ...state, additionalClassesBool: action.writeAdditionalClassesBool };
    case "CC_SAVE_GLOBAL_STYLESHEET":
      return { ...state, saveGlobalStylesheet: action.writeSaveGlobalStylesheet };
    case "CC_SECTION_DEFAULT":
      return { ...state, sectionDefaults: action.writeSectionDefaults };
    case "CC_IS_RESOLVING":
      return { ...state, isResolving: action.writeIsResolving };
    case "CC_ALTKEY":
      return { ...state, altKey: action.writeAltKey };
    case "CC_WOO_ATTRIBUTES":
      return { ...state, wooAttributes: action.writeWooAttributes };
    case "CC_WOO_ATTRIBUTES_TERMS":
      return { ...state, wooAttributesTerms: action.writeWooAttributesTerms };
    case "CC_WOO_PRODUCT_TYPES":
      return { ...state, wooProductTypes: action.writeWooProductTypes };
    case "CC_WOO_TAX_CLASSES":
      return { ...state, wooTaxClasses: action.writeWooTaxClasses };
    case "CC_WOO_SHIPPING_CLASSES":
      return { ...state, wooShippingClasses: action.writeWooShippingClasses };
    case "CC_HIDEMODALS":
      return { ...state, hideModals: action.writeHideModals };
    case "CC_WOO_PRODUCTS":
      return { ...state, wooProducts: action.writeWooProducts };
    case "CC_GOOGLE_FONTS":
      return { ...state, googleFonts: action.writeGoogleFonts };
    case "CC_USER_CAPABILITIES":
      return { ...state, userCapabilities: action.writeUserCapabilities };
    case "CC_USER_ROLES":
      return { ...state, userRoles: action.writeUserRoles };
    case "CC_HIDEHOOKS":
      return { ...state, hideHooks: action.writeHideHooks };
    case "CC_DARKMODE":
      return { ...state, darkMode: action.writeDarkMode };
    case "CC_PSEUDOCLASS":
      return { ...state, pseudoClass: action.writePseudoClass };
    case "CC_GLOBAL_STYLESHEETS":
      return { ...state, globalStylesheets: action.writeGlobalStylesheets };
    case "CC_GLOBAL_INTERACTIONS":
      return { ...state, globalInteractions: action.writeGlobalInteractions };
    case "CC_INSPECTOR_POSITION":
      return { ...state, inspectorPosition: action.writeInspectorPosition };
    case "CC_GLOBAL_CLASSES":
      return { ...state, globalClasses: action.writeGlobalClasses };
    case "CC_GLOBAL_CLASSES_RENDERED":
      return { ...state, globalClassesRendered: action.writeGlobalClassesRendered };
    case "CC_SELECTED_GLOBAL_CLASS":
      return { ...state, selectedGlobalClass: action.writeSelectedGlobalClass };
    case "CC_LOCAL_FONTS":
      return { ...state, localFonts: action.writeLocalFonts };
    case "CC_LOCAL_ACTIVE_FONTS":
      return { ...state, localActiveFonts: action.writeLocalActiveFonts };
    case "CC_HEARTBEAT":
      return { ...state, heartbeat: action.writeHeartbeat };
    case "CC_COMPONENTS_FOLDERS":
      return { ...state, componentsFolders: action.writeComponentsFolders };
    default:
      return state;
  }
}
