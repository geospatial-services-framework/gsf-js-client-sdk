const webpackBase = require('./webpack-base.config');
const merge = require('webpack-merge');

const target = 'node';
const entries = ['eventsource/lib/eventsource', './GSF.js'];
const addSuffix = true;
const minify = false;

const base = webpackBase(target, entries, addSuffix, minify);

const nodeConfig = {
};

module.exports = merge(base, nodeConfig);
