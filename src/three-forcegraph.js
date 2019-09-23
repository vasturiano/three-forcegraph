import { Group } from 'three';
const three = window.THREE ? window.THREE : { Group }; // Prefer consumption from global THREE, if exists

import ForceGraph from './forcegraph-kapsule.js';
import fromKapsule from './utils/kapsule-class.js';

export default fromKapsule(ForceGraph, three.Group, true);
