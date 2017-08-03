
const webpackBase = require('./webpack-base.config');
const merge = require('webpack-merge');

const target = 'web';
// const entries = ['eventsource/example/eventsource-polyfill', './GSF.js']; // Uncomment to turn on polyfill.
const entries = ['./GSF.js'];
const addSuffix = false;
const minify = true;

const base = webpackBase(target, entries, addSuffix, minify);
const webConfig = {
};

module.exports = merge(base, webConfig);
