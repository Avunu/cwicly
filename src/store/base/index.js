/**
 * Cwicly Base Store
 */
import { registerStore } from '@wordpress/data';
import reducer from './reducer.js';
import * as actions from './actions.js';
import * as selectors from './selectors.js';

registerStore('cwicly/base', {
  reducer,
  actions,
  selectors,
});
