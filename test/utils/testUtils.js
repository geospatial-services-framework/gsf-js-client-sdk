const expect = require('chai').expect;

const verifyProperties = function(isObj, expectProps) {
  Object.keys(expectProps).forEach(function(prop) {
    expect(isObj[prop]).to.exist;
    expect(typeof isObj[prop]).to.equal(expectProps[prop].type);
    if (expectProps[prop].props) {
      verifyProperties(isObj[prop], expectProps[prop].props);
    }
  });
};

export default {
  verifyProperties: verifyProperties
};
