import { expect } from 'chai';

const verifyProperties = function(isObj, expectProps) {
  Object.keys(expectProps).forEach(function(propName) {
    if (isObj[propName] || expectProps[propName].required) {
      expect(isObj[propName]).to.exist;
      expect(typeof isObj[propName]).to.equal(expectProps[propName].type);
    }
  });
};

export default {
  verifyProperties: verifyProperties
};
