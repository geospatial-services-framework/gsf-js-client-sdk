import { expect } from 'chai';

const verifyProperties = (properties, interfaces) => {
  Object.keys(interfaces).forEach(function(propName) {
    if (properties[propName] || interfaces[propName].required) {
      expect(typeof properties[propName],
        `${propName} is type ${interfaces[propName].type}`)
        .to.equal(interfaces[propName].type);
    }
  });
};

export default {
  verifyProperties
};
