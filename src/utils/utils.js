const detectNode = require('detect-is-node');

// Detects if the current browser is IE.
const isIE = () => {
  if (!detectNode()) {
    const isIE = require('component-ie');
    return isIE;
  }
  return false;
};

// Detects if the current environment is Node.js.
const isNode = detectNode;

export default {
  isIE,
  isNode
};
