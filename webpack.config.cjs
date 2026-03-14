const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  externals: {
    ...defaultConfig.externals,
    'react': 'React',
    'react-dom': 'ReactDOM',
    // The following are typically handled by @wordpress/scripts/config/webpack.config
    // but we can list them explicitly if needed to be 100% sure.
    '@wordpress/blocks': ['wp', 'blocks'],
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/data': ['wp', 'data'],
    '@wordpress/i18n': ['wp', 'i18n'],
    '@wordpress/components': ['wp', 'components'],
    '@wordpress/block-editor': ['wp', 'blockEditor'],
    '@wordpress/compose': ['wp', 'compose'],
    '@wordpress/hooks': ['wp', 'hooks'],
    '@wordpress/api-fetch': ['wp', 'apiFetch'],
    '@wordpress/url': ['wp', 'url'],
    '@wordpress/blob': ['wp', 'blob'],
    '@wordpress/core-data': ['wp', 'coreData'],
    '@wordpress/rich-text': ['wp', 'richText'],
    '@wordpress/edit-post': ['wp', 'editPost'],
    '@wordpress/plugins': ['wp', 'plugins'],
    '@wordpress/notices': ['wp', 'notices'],
    '@wordpress/keycodes': ['wp', 'keycodes'],
    '@wordpress/date': ['wp', 'date'],
    '@wordpress/primitives': ['wp', 'primitives'],
  },
  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...defaultConfig.resolve?.alias,
      '@components': path.resolve(__dirname, 'src/components/'),
      '@store': path.resolve(__dirname, 'src/store/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
};
