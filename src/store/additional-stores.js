/**
 * Cwicly Additional Stores
 */
import { registerStore } from '@wordpress/data';

const ab = (e) => e;

// Navigator Store
registerStore('cwicly/navigator', {
  reducer: (state = false, action) => {
    return action.type === 'CC_NAVIGATOR' ? action.ccNavigator : state;
  },
  selectors: {
    getNavigatorState: (state) => state,
  },
  actions: {
    ccNavigator: (value) => ({ type: 'CC_NAVIGATOR', ccNavigator: value }),
  },
});

// License Store
registerStore('cwicly/license', {
  reducer: (state = '', action) => {
    return action.type === 'CC_LICENSE' ? action.ccLicense : state;
  },
  selectors: {
    getLicenseState: (state) => state,
  },
  actions: {
    ccLicense: (value) => ({ type: 'CC_LICENSE', ccLicense: value }),
  },
});

// Breakpoints Store
registerStore('cwicly/breakpoints', {
  reducer: (state = {}, action) => {
    return action.type === 'CC_BREAKPOINTS' ? action.breakpointer : state;
  },
  selectors: {
    getValue: ab,
  },
  actions: {
    breakpointer: (value) => ({ type: 'CC_BREAKPOINTS', breakpointer: value }),
  },
});

// Block IDs Store
registerStore('cwicly/blockids', {
  reducer: (state = [], action) => {
    return action.type === 'BLOCK_IDS' ? action.blockIds : state;
  },
  selectors: {
    getBlockIds: (state) => state,
  },
  actions: {
    blockIds: (value) => ({ type: 'BLOCK_IDS', blockIds: value }),
  },
});

// Dynamic Preview Store
registerStore('cwicly/dynamicpreview', {
  reducer: (state = void 0, action) => {
    return action.type === 'DYNAMICPREVIEW' ? action.dynamicpreview : state;
  },
  selectors: {
    getDynamicPreview: (state) => state,
  },
  actions: {
    dynamicpreview: (value) => ({ type: 'DYNAMICPREVIEW', dynamicpreview: value }),
  },
});

// Backend Back Store
registerStore('cwicly/backendback', {
  reducer: (state = false, action) => {
    return action.type === 'BACKENDBACK' ? action.backendBack : state;
  },
  selectors: {
    getValue: ab,
  },
  actions: {
    backendBack: (value) => ({ type: 'BACKENDBACK', backendBack: value }),
  },
});

// Hide Modals Store
registerStore('cwicly/hidemodals', {
  reducer: (state = false, action) => {
    return action.type === 'HIDE_MODALS' ? action.hideModals : state;
  },
  selectors: {
    getHideModals: (state) => state,
  },
  actions: {
    hideModals: (value) => ({ type: 'HIDE_MODALS', hideModals: value }),
  },
});

// My Collection Store
registerStore('cwicly/mycollection', {
  reducer: (state = [], action) => {
    return action.type === 'MY_COLLECTION' ? action.myCollection : state;
  },
  selectors: {
    getMyCollection: (state) => state,
  },
  actions: {
    myCollection: (value) => ({ type: 'MY_COLLECTION', myCollection: value }),
  },
});

// Slider IDs Store
registerStore('cwicly/sliderids', {
  reducer: (state = [], action) => {
    return action.type === 'SLIDER_IDS' ? action.sliderIds : state;
  },
  selectors: {
    getSliderIds: (state) => state,
  },
  actions: {
    sliderIds: (value) => ({ type: 'SLIDER_IDS', sliderIds: value }),
  },
});

// Classes Store
registerStore('cwicly/classes', {
  reducer: (state = {}, action) => {
    if (action.type === 'CC_CLASSES') {
      const newState = { ...state };
      const [key, value] = action.ccClasses;
      newState[key] = value;
      return newState;
    }
    if (action.type === 'CC_SET_CLASSES') {
      return { ...state, ...action.setClasses };
    }
    return action.type === 'CC_NO_CLASSES' ? action.noClasses : state;
  },
  selectors: {
    getClasses: (state) => state,
  },
  actions: {
    ccClasses: (value) => ({ type: 'CC_CLASSES', ccClasses: value }),
    setClasses: (value) => ({ type: 'CC_SET_CLASSES', setClasses: value }),
    noClasses: (value) => ({ type: 'CC_NO_CLASSES', noClasses: value }),
  },
});
