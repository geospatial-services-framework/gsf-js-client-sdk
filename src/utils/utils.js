// Detects if the current browser is IE.
const isIE = () => {
  if (!NODE) {
    const isIE = require('component-ie');
    return isIE;
  }
  return false;
};

export default {
  isIE
};
