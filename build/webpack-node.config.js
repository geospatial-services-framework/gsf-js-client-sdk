const webpackBase = require('./webpack-base.config');

const TARGET = 'node';
const ENTRIES = ['eventsource/lib/eventsource', './GSF.js'];
const addSuffix = true;
const minify = false;

module.exports = webpackBase(TARGET, ENTRIES, addSuffix, minify);
