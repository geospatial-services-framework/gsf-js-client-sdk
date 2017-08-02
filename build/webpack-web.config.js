
const webpackBase = require('./webpack-base.config');

const TARGET = 'web';
// const ENTRIES = ['eventsource/example/eventsource-polyfill', './GSF.js']; // Uncomment to turn on polyfill.
const ENTRIES = ['./GSF.js'];
const addSuffix = false;
const minify = true;

module.exports = webpackBase(TARGET, ENTRIES, addSuffix, minify);
