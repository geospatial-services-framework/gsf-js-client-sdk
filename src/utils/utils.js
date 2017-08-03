// Detects if the current browser is IE.
const isIE = () => {
  if (!NODE) {
    // This require call returns the running version of IE or undefined
    const isIE = require('component-ie');
    return isIE;
  }
  return false;
};

export default {
  isIE
};
