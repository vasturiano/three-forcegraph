import DataBindMapper from 'data-bind-mapper';

import { emptyObject } from './three-gc';

class ThreeDigest extends DataBindMapper {
  constructor(scene, {
    dataBindAttr = '__data',
    objBindAttr = '__threeObj'
  } = {}) {
    super();

    this.scene = scene;
    this.#dataBindAttr = dataBindAttr;
    this.#objBindAttr = objBindAttr;

    this.onRemoveObj(() => {});
  }

  onCreateObj(fn) {
    super.onCreateObj(d => {
      const obj = fn(d);
      d[this.#objBindAttr] = obj;
      obj[this.#dataBindAttr] = d;
      this.scene.add(obj);

      return obj;
    });
    return this;
  }

  onRemoveObj(fn) {
    super.onRemoveObj((obj, dId) => {
      const d = super.getData(obj);
      fn(obj, dId);

      this.scene.remove(obj);
      emptyObject(obj);

      delete d[this.#objBindAttr];
    });
    return this;
  }

  scene;
  #dataBindAttr;
  #objBindAttr;
}

export default ThreeDigest;
