import dataJoint from 'data-joint';

import { emptyObject } from './three-gc';

function threeDigest(data, scene, {
  objFilter = () => true,
  ...options
} = {}) {
  return dataJoint(
    data,
    scene.children.filter(objFilter),
    obj => scene.add(obj),
    obj => {
      scene.remove(obj);
      emptyObject(obj);
    },
    {
      objBindAttr: '__threeObj',
      ...options
    }
  );
}

export default threeDigest;
