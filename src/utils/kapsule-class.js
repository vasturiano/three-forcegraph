export default function(kapsule, baseClass = Object, initKapsuleWithSelf = false) {

  class ForceGraph extends baseClass {
    constructor(...args) {
      super(...args);
      this.__kapsuleInstance = new kapsule(...[...(initKapsuleWithSelf ? [this] : []), ...args]);
    }
  }

  // attach kapsule props/methods to class prototype
  Object.keys(kapsule())
    .forEach(m => ForceGraph.prototype[m] = function(...args) {
      const returnVal = this.__kapsuleInstance[m](...args);

      return returnVal === this.__kapsuleInstance
        ? this  // chain based on this class, not the kapsule obj
        : returnVal;
    });

  return ForceGraph;

}
