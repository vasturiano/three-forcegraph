import {
  Mesh,
  MeshLambertMaterial,
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  Vector3,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  Line,
  LineBasicMaterial,
  QuadraticBezierCurve3,
  CubicBezierCurve3
} from 'three';

const three = window.THREE
  ? window.THREE // Prefer consumption from global THREE, if exists
  : {
    Mesh,
    MeshLambertMaterial,
    BufferGeometry,
    BufferAttribute,
    Matrix4,
    Vector3,
    SphereGeometry,
    CylinderGeometry,
    ConeGeometry,
    Line,
    LineBasicMaterial,
    QuadraticBezierCurve3,
    CubicBezierCurve3
  };

import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceCenter as d3ForceCenter,
  forceRadial as d3ForceRadial
} from 'd3-force-3d';

import graph from 'ngraph.graph';
import forcelayout from 'ngraph.forcelayout';
import forcelayout3d from 'ngraph.forcelayout3d';
const ngraph = { graph, forcelayout, forcelayout3d };

import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';

import { autoColorObjects, colorStr2Hex, colorAlpha } from './color-utils';
import getDagDepths from './dagDepths';

//

const DAG_LEVEL_NODE_RATIO = 2;

export default Kapsule({

  props: {
    jsonUrl: {
      onChange: function(jsonUrl, state) {
        if (jsonUrl && !state.fetchingJson) {
          // Load data asynchronously
          state.fetchingJson = true;
          state.onLoading();

          fetch(jsonUrl).then(r => r.json()).then(json => {
            state.fetchingJson = false;
            this.graphData(json);
          });
        }
      },
      triggerUpdate: false
    },
    graphData: {
      default: {
        nodes: [],
        links: []
      },
      onChange(graphData, state) {
        if (graphData.nodes.length || graphData.links.length) {
          console.info('force-graph loading', graphData.nodes.length + ' nodes', graphData.links.length + ' links');
        }

        state.engineRunning = false; // Pause simulation immediately
        state.sceneNeedsRepopulating = true;
        state.simulationNeedsReheating = true;
      }
    },
    numDimensions: {
      default: 3,
      onChange(numDim, state) {
        state.simulationNeedsReheating = true;

        const chargeForce = state.d3ForceLayout.force('charge');
        // Increase repulsion on 3D mode for improved spatial separation
        if (chargeForce) { chargeForce.strength(numDim > 2 ? -60 : -30) }

        if (numDim < 3) { eraseDimension(state.graphData.nodes, 'z'); }
        if (numDim < 2) { eraseDimension(state.graphData.nodes, 'y'); }

        function eraseDimension(nodes, dim) {
          nodes.forEach(d => {
            delete d[dim];     // position
            delete d[`v${dim}`]; // velocity
          });
        }
      }
    },
    dagMode: { onChange(_, state) { state.simulationNeedsReheating = true } }, // td, bu, lr, rl, zin, zout, radialin, radialout
    dagLevelDistance: { onChange(_, state) { state.simulationNeedsReheating = true } },
    nodeRelSize: { default: 4, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // volume per val unit
    nodeId: { default: 'id', onChange(_, state) { state.simulationNeedsReheating = true } },
    nodeVal: { default: 'val', onChange(_, state) { state.sceneNeedsRepopulating = true } },
    nodeResolution: { default: 8, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // how many slice segments in the sphere's circumference
    nodeColor: { default: 'color', onChange(_, state) { state.sceneNeedsRepopulating = true } },
    nodeAutoColorBy: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    nodeOpacity: { default: 0.75, onChange(_, state) { state.sceneNeedsRepopulating = true } },
    nodeThreeObject: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkSource: { default: 'source', onChange(_, state) { state.simulationNeedsReheating = true } },
    linkTarget: { default: 'target', onChange(_, state) { state.simulationNeedsReheating = true } },
    linkVisibility: { default: true, onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkColor: { default: 'color', onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkAutoColorBy: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkOpacity: { default: 0.2, onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkWidth: { onChange(_, state) { state.sceneNeedsRepopulating = true } }, // Rounded to nearest decimal. For falsy values use dimensionless line with 1px regardless of distance.
    linkResolution: { default: 6, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // how many radial segments in each line tube's geometry
    linkCurvature: { default: 0, triggerUpdate: false }, // line curvature radius (0: straight, 1: semi-circle)
    linkCurveRotation: { default: 0, triggerUpdate: false }, // line curve rotation along the line axis (0: interection with XY plane, PI: upside down)
    linkMaterial: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkThreeObject: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkPositionUpdate: { triggerUpdate: false }, // custom function to call for updating the link's position. Signature: (threeObj, { start: { x, y, z},  end: { x, y, z }}, link). If the function returns a truthy value, the regular link position update will not run.
    linkDirectionalArrowLength: { default: 0, onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkDirectionalArrowColor: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkDirectionalArrowRelPos: { default: 0.5, triggerUpdate: false }, // value between 0<>1 indicating the relative pos along the (exposed) line
    linkDirectionalArrowResolution: { default: 8, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // how many slice segments in the arrow's conic circumference
    linkDirectionalParticles: { default: 0, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: { default: 0.01, triggerUpdate: false }, // in link length ratio per frame
    linkDirectionalParticleWidth: { default: 0.5, onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkDirectionalParticleColor: { onChange(_, state) { state.sceneNeedsRepopulating = true } },
    linkDirectionalParticleResolution: { default: 4, onChange(_, state) { state.sceneNeedsRepopulating = true } }, // how many slice segments in the particle sphere's circumference
    forceEngine: { default: 'd3', onChange(_, state) { state.simulationNeedsReheating = true } }, // d3 or ngraph
    d3AlphaDecay: { default: 0.0228, triggerUpdate: false, onChange(alphaDecay, state) { state.d3ForceLayout.alphaDecay(alphaDecay) }},
    d3AlphaTarget: { default: 0, triggerUpdate: false, onChange(alphaTarget, state) { state.d3ForceLayout.alphaTarget(alphaTarget) }},
    d3VelocityDecay: { default: 0.4, triggerUpdate: false, onChange(velocityDecay, state) { state.d3ForceLayout.velocityDecay(velocityDecay) } },
    warmupTicks: { default: 0, triggerUpdate: false }, // how many times to tick the force engine at init before starting to render
    cooldownTicks: { default: Infinity, triggerUpdate: false },
    cooldownTime: { default: 15000, triggerUpdate: false }, // ms
    onLoading: { default: () => {}, triggerUpdate: false },
    onFinishLoading: { default: () => {}, triggerUpdate: false },
    onEngineTick: { default: () => {}, triggerUpdate: false },
    onEngineStop: { default: () => {}, triggerUpdate: false }
  },

  aliases: {
    autoColorBy: 'nodeAutoColorBy'
  },

  methods: {
    // Expose d3 forces for external manipulation
    d3Force: function(state, forceName, forceFn) {
      if (forceFn === undefined) {
        return state.d3ForceLayout.force(forceName); // Force getter
      }
      state.d3ForceLayout.force(forceName, forceFn); // Force setter
      return this;
    },
    _updateScene: function(state) {

    },
    // reset cooldown state
    resetCountdown: function(state) {
      state.cntTicks = 0;
      state.startTickTime = new Date();
      state.engineRunning = true;
      return this;
    },
    tickFrame: function(state) {
      const isD3Sim = state.forceEngine !== 'ngraph';

      if (state.engineRunning) { layoutTick(); }
      updateArrows();
      updatePhotons();

      return this;

      //

      function layoutTick() {
        if (++state.cntTicks > state.cooldownTicks || (new Date()) - state.startTickTime > state.cooldownTime) {
          state.engineRunning = false; // Stop ticking graph
          state.onEngineStop();
        } else {
          state.layout[isD3Sim ? 'tick' : 'step'](); // Tick it
          state.onEngineTick();
        }

        // Update nodes position
        state.graphData.nodes.forEach(node => {
          const obj = node.__threeObj;
          if (!obj) return;

          const pos = isD3Sim ? node : state.layout.getNodePosition(node[state.nodeId]);

          obj.position.x = pos.x;
          obj.position.y = pos.y || 0;
          obj.position.z = pos.z || 0;
        });

        // Update links position
        const linkCurvatureAccessor = accessorFn(state.linkCurvature);
        const linkCurveRotationAccessor = accessorFn(state.linkCurveRotation);
        state.graphData.links.forEach(link => {
          const line = link.__lineObj;
          if (!line) return;

          const pos = isD3Sim
            ? link
            : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? 'source' : 'from'];
          const end = pos[isD3Sim ? 'target' : 'to'];

          if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

          if (state.linkPositionUpdate && state.linkPositionUpdate(
              line,
              { start: { x: start.x, y: start.y, z: start.z }, end: { x: end.x, y: end.y, z: end.z } },
              link)
          ) {
            // exit if successfully custom updated position
            return;
          }

          link.__curve = null; // Wipe curve ref from object

          if (line.type === 'Line') { // Update line geometry
            const curvature = linkCurvatureAccessor(link);
            const curveResolution = 30; // # line segments

            if (!curvature) {
              let linePos = line.geometry.getAttribute('position');
              if (!linePos || !linePos.array || linePos.array.length !== 6) {
                line.geometry.addAttribute('position', linePos = new three.BufferAttribute(new Float32Array(2 * 3), 3));
              }

              linePos.array[0] = start.x;
              linePos.array[1] = start.y || 0;
              linePos.array[2] = start.z || 0;
              linePos.array[3] = end.x;
              linePos.array[4] = end.y || 0;
              linePos.array[5] = end.z || 0;

              linePos.needsUpdate = true;

            } else { // bezier curve line
              const vStart = new three.Vector3(start.x, start.y || 0, start.z || 0);
              const vEnd= new three.Vector3(end.x, end.y || 0, end.z || 0);

              const l = vStart.distanceTo(vEnd); // line length

              let curve;
              const curveRotation = linkCurveRotationAccessor(link);

              if (l > 0) {
                const dx = end.x - start.x;
                const dy = end.y - start.y || 0;

                const vLine = new three.Vector3()
                  .subVectors(vEnd, vStart);

                const cp = vLine.clone()
                  .multiplyScalar(curvature)
                  .cross((dx !== 0 || dy !== 0) ? new three.Vector3(0, 0, 1) : new three.Vector3(0, 1, 0)) // avoid cross-product of parallel vectors (prefer Z, fallback to Y)
                  .applyAxisAngle(vLine.normalize(), curveRotation) // rotate along line axis according to linkCurveRotation
                  .add((new three.Vector3()).addVectors(vStart, vEnd).divideScalar(2));

                curve = new three.QuadraticBezierCurve3(vStart, cp, vEnd);
              } else { // Same point, draw a loop
                const d = curvature * 70;
                const endAngle = -curveRotation; // Rotate clockwise (from Z angle perspective)
                const startAngle = endAngle + Math.PI / 2;

                curve = new three.CubicBezierCurve3(
                  vStart,
                  new three.Vector3(d * Math.cos(startAngle), d * Math.sin(startAngle), 0).add(vStart),
                  new three.Vector3(d * Math.cos(endAngle), d * Math.sin(endAngle), 0).add(vStart),
                  vEnd
                );
              }

              line.geometry.setFromPoints(curve.getPoints(curveResolution));
              link.__curve = curve;
            }
            line.geometry.computeBoundingSphere();

          } else if (line.type === 'Mesh') { // Update cylinder geometry
            // links with width ignore linkCurvature because TubeGeometries can't be updated

            const vStart = new three.Vector3(start.x, start.y || 0, start.z || 0);
            const vEnd = new three.Vector3(end.x, end.y || 0, end.z || 0);
            const distance = vStart.distanceTo(vEnd);

            line.position.x = vStart.x;
            line.position.y = vStart.y;
            line.position.z = vStart.z;
            line.lookAt(vEnd);
            line.scale.z = distance;
          }
        });
      }

      function updateArrows() {
        // update link arrow position
        const arrowRelPosAccessor = accessorFn(state.linkDirectionalArrowRelPos);
        const arrowLengthAccessor = accessorFn(state.linkDirectionalArrowLength);
        const nodeValAccessor = accessorFn(state.nodeVal);

        state.graphData.links.forEach(link => {
          const arrowObj = link.__arrowObj;
          if (!arrowObj) return;

          const pos = isD3Sim
            ? link
            : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? 'source' : 'from'];
          const end = pos[isD3Sim ? 'target' : 'to'];

          if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

          const startR = Math.sqrt(Math.max(0, nodeValAccessor(start) || 1)) * state.nodeRelSize;
          const endR = Math.sqrt(Math.max(0, nodeValAccessor(end) || 1)) * state.nodeRelSize;

          const arrowLength = arrowLengthAccessor(link);
          const arrowRelPos = arrowRelPosAccessor(link);

          const getPosAlongLine = link.__curve
            ? t => link.__curve.getPoint(t) // interpolate along bezier curve
            : t => {
            // straight line: interpolate linearly
            const iplt = (dim, start, end, t) => start[dim] + (end[dim] - start[dim]) * t || 0;
            return {
              x: iplt('x', start, end, t),
              y: iplt('y', start, end, t),
              z: iplt('z', start, end, t)
            }
          };

          const lineLen = link.__curve
            ? link.__curve.getLength()
            : Math.sqrt(['x', 'y', 'z'].map(dim => Math.pow((end[dim] || 0) - (start[dim] || 0), 2)).reduce((acc, v) => acc + v, 0));

          const posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;

          const arrowHead = getPosAlongLine(posAlongLine / lineLen);
          const arrowTail = getPosAlongLine((posAlongLine - arrowLength) / lineLen);

          ['x', 'y', 'z'].forEach(dim => arrowObj.position[dim] = arrowTail[dim]);
          arrowObj.lookAt(arrowHead.x, arrowHead.y, arrowHead.z);
        });
      }

      function updatePhotons() {
        // update link particle positions
        const particleSpeedAccessor = accessorFn(state.linkDirectionalParticleSpeed);
        state.graphData.links.forEach(link => {
          const photons = link.__photonObjs;
          if (!photons || !photons.length) return;

          const pos = isD3Sim
            ? link
            : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? 'source' : 'from'];
          const end = pos[isD3Sim ? 'target' : 'to'];

          if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

          const particleSpeed = particleSpeedAccessor(link);

          const getPhotonPos = link.__curve
            ? t => link.__curve.getPoint(t) // interpolate along bezier curve
            : t => {
              // straight line: interpolate linearly
              const iplt = (dim, start, end, t) => start[dim] + (end[dim] - start[dim]) * t || 0;
              return {
                x: iplt('x', start, end, t),
                y: iplt('y', start, end, t),
                z: iplt('z', start, end, t)
              }
            };

          photons.forEach((photon, idx) => {
            const photonPosRatio = photon.__progressRatio =
              ((photon.__progressRatio || (idx / photons.length)) + particleSpeed) % 1;

            const pos = getPhotonPos(photonPosRatio);
            ['x', 'y', 'z'].forEach(dim => photon.position[dim] = pos[dim]);
          });
        });
      }
    }
  },

  stateInit: () => ({
    d3ForceLayout: d3ForceSimulation()
      .force('link', d3ForceLink())
      .force('charge', d3ForceManyBody())
      .force('center', d3ForceCenter())
      .force('dagRadial', null)
      .stop(),
    engineRunning: false,
    sceneNeedsRepopulating: true,
    simulationNeedsReheating: true
  }),

  init(threeObj, state) {
    // Main three object to manipulate
    state.graphScene = threeObj;
  },

  update(state) {
    state.engineRunning = false; // pause simulation

    if (state.sceneNeedsRepopulating) {
      state.sceneNeedsRepopulating = false;

      if (state.nodeAutoColorBy !== null) {
        // Auto add color to uncolored nodes
        autoColorObjects(state.graphData.nodes, accessorFn(state.nodeAutoColorBy), state.nodeColor);
      }
      if (state.linkAutoColorBy !== null) {
        // Auto add color to uncolored links
        autoColorObjects(state.graphData.links, accessorFn(state.linkAutoColorBy), state.linkColor);
      }

      // Clear the scene
      const materialDispose = material => {
        if (material instanceof Array) {
          material.forEach(materialDispose);
        } else {
          if (material.map) { material.map.dispose(); }
          material.dispose();
        }
      };
      const deallocate = obj => {
        if (obj.geometry) { obj.geometry.dispose(); }
        if (obj.material) { materialDispose(obj.material); }
        if (obj.texture) { obj.texture.dispose(); }
        if (obj.children) { obj.children.forEach(deallocate); }
      };
      while (state.graphScene.children.length) {
        const obj = state.graphScene.children[0];
        state.graphScene.remove(obj);
        deallocate(obj);
      }

      // Add WebGL objects
      const customNodeObjectAccessor = accessorFn(state.nodeThreeObject);
      const valAccessor = accessorFn(state.nodeVal);
      const colorAccessor = accessorFn(state.nodeColor);
      const sphereGeometries = {}; // indexed by node value
      const sphereMaterials = {}; // indexed by color
      state.graphData.nodes.forEach(node => {
        const customObj = customNodeObjectAccessor(node);

        let obj;
        if (customObj) {
          obj = customObj;

          if (state.nodeThreeObject === obj) {
            // clone object if it's a shared object among all nodes
            obj = obj.clone();
          }
        } else { // Default object (sphere mesh)
          const val = valAccessor(node) || 1;
          if (!sphereGeometries.hasOwnProperty(val)) {
            sphereGeometries[val] = new three.SphereGeometry(Math.cbrt(val) * state.nodeRelSize, state.nodeResolution, state.nodeResolution);
          }

          const color = colorAccessor(node);
          if (!sphereMaterials.hasOwnProperty(color)) {
            sphereMaterials[color] = new three.MeshLambertMaterial({
              color: colorStr2Hex(color || '#ffffaa'),
              transparent: true,
              opacity: state.nodeOpacity * colorAlpha(color)
            });
          }

          obj = new three.Mesh(sphereGeometries[val], sphereMaterials[color]);
        }

        obj.__graphObjType = 'node'; // Add object type
        obj.__data = node; // Attach node data

        state.graphScene.add(node.__threeObj = obj);
      });

      const customLinkObjectAccessor = accessorFn(state.linkThreeObject);
      const customLinkMaterialAccessor = accessorFn(state.linkMaterial);
      const linkVisibilityAccessor = accessorFn(state.linkVisibility);
      const linkColorAccessor = accessorFn(state.linkColor);
      const linkWidthAccessor = accessorFn(state.linkWidth);
      const linkArrowLengthAccessor = accessorFn(state.linkDirectionalArrowLength);
      const linkArrowColorAccessor = accessorFn(state.linkDirectionalArrowColor);
      const linkParticlesAccessor = accessorFn(state.linkDirectionalParticles);
      const linkParticleWidthAccessor = accessorFn(state.linkDirectionalParticleWidth);
      const linkParticleColorAccessor = accessorFn(state.linkDirectionalParticleColor);

      const lineMaterials = {}; // indexed by link color
      const cylinderGeometries = {}; // indexed by link width
      const particleMaterials = {}; // indexed by link color
      const particleGeometries = {}; // indexed by particle width
      state.graphData.links.forEach(link => {
        if (!linkVisibilityAccessor(link)) {
          // Exclude non-visible links
          link.__lineObj = link.__arrowObj = link.__photonObjs = null;
          return;
        }

        const color = linkColorAccessor(link);

        const customObj = customLinkObjectAccessor(link);
        let lineObj;
        if (customObj) {
          lineObj = customObj;

          if (state.linkThreeObject === lineObj) {
            // clone object if it's a shared object among all links
            lineObj = lineObj.clone();
          }
        } else {
          // Add default line object
          const linkWidth = Math.ceil(linkWidthAccessor(link) * 10) / 10;

          const useCylinder = !!linkWidth;

          let geometry;
          if (useCylinder) {
            if (!cylinderGeometries.hasOwnProperty(linkWidth)) {
              const r = linkWidth / 2;
              geometry = new three.CylinderGeometry(r, r, 1, state.linkResolution, 1, false);
              geometry.applyMatrix(new three.Matrix4().makeTranslation(0, 1 / 2, 0));
              geometry.applyMatrix(new three.Matrix4().makeRotationX(Math.PI / 2));
              cylinderGeometries[linkWidth] = geometry;
            }
            geometry = cylinderGeometries[linkWidth];
          } else { // Use plain line (constant width)
            geometry = new three.BufferGeometry();
          }

          let lineMaterial = customLinkMaterialAccessor(link);
          if (!lineMaterial) {
            if (!lineMaterials.hasOwnProperty(color)) {
              const lineOpacity = state.linkOpacity * colorAlpha(color);
              lineMaterials[color] = new three.MeshLambertMaterial({
                color: colorStr2Hex(color || '#f0f0f0'),
                transparent: lineOpacity < 1,
                opacity: lineOpacity,
                depthWrite: lineOpacity >= 1 // Prevent transparency issues
              });
            }
            lineMaterial = lineMaterials[color];
          }

          lineObj = new three[useCylinder ? 'Mesh' : 'Line'](geometry, lineMaterial);
        }

        lineObj.renderOrder = 10; // Prevent visual glitches of dark lines on top of nodes by rendering them last

        lineObj.__graphObjType = 'link'; // Add object type
        lineObj.__data = link; // Attach link data

        state.graphScene.add(link.__lineObj = lineObj);

        // Add arrow
        const arrowLength = linkArrowLengthAccessor(link);
        if (arrowLength && arrowLength > 0) {
          const arrowColor = linkArrowColorAccessor(link) || color || '#f0f0f0';

          const coneGeometry = new three.ConeGeometry(arrowLength * 0.25, arrowLength, state.linkDirectionalArrowResolution);
          // Correct orientation
          coneGeometry.translate(0, arrowLength / 2, 0);
          coneGeometry.rotateX(Math.PI / 2);

          const arrowObj = new three.Mesh(
            coneGeometry,
            new three.MeshLambertMaterial({
              color: colorStr2Hex(arrowColor),
              transparent: true,
              opacity: state.linkOpacity * 3
            })
          );

          state.graphScene.add(link.__arrowObj = arrowObj);
        }

        // Add photon particles
        const numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));
        const photonR = Math.ceil(linkParticleWidthAccessor(link) * 10) / 10 / 2;
        const photonColor = linkParticleColorAccessor(link) || color || '#f0f0f0';

        if (!particleGeometries.hasOwnProperty(photonR)) {
          particleGeometries[photonR] = new three.SphereGeometry(photonR, state.linkDirectionalParticleResolution, state.linkDirectionalParticleResolution);
        }
        const particleGeometry = particleGeometries[photonR];

        if (!particleMaterials.hasOwnProperty(photonColor)) {
          particleMaterials[photonColor] = new three.MeshLambertMaterial({
            color: colorStr2Hex(photonColor),
            transparent: true,
            opacity: state.linkOpacity * 3
          });
        }
        const particleMaterial = particleMaterials[photonColor];

        const photons = [...Array(numPhotons)].map(() => new three.Mesh(particleGeometry, particleMaterial));
        photons.forEach(photon => state.graphScene.add(photon));
        link.__photonObjs = photons;
      });
    }

    if (state.simulationNeedsReheating) {
      state.simulationNeedsReheating = false;
      state.engineRunning = false; // Pause simulation

      // parse links
      state.graphData.links.forEach(link => {
        link.source = link[state.linkSource];
        link.target = link[state.linkTarget];
      });

      // Feed data to force-directed layout
      const isD3Sim = state.forceEngine !== 'ngraph';
      let layout;
      if (isD3Sim) {
        // D3-force
        (layout = state.d3ForceLayout)
          .stop()
          .alpha(1)// re-heat the simulation
          .numDimensions(state.numDimensions)
          .nodes(state.graphData.nodes);

        // add links (if link force is still active)
        const linkForce = state.d3ForceLayout.force('link');
        if (linkForce) {
          linkForce
            .id(d => d[state.nodeId])
            .links(state.graphData.links);
        }

        // setup dag force constraints
        const nodeDepths = state.dagMode && getDagDepths(state.graphData, node => node[state.nodeId]);
        const maxDepth = Math.max(...Object.values(nodeDepths || []));
        const dagLevelDistance = state.dagLevelDistance || (
          state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO
          * (['radialin', 'radialout'].indexOf(state.dagMode) !== -1 ? 0.7 : 1)
        );

        // Fix nodes to x,y,z for dag mode
        if (state.dagMode) {
          const getFFn = (fix, invert) => node => !fix
            ? undefined
            : (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);

          const fxFn = getFFn(['lr', 'rl'].indexOf(state.dagMode) !== -1, state.dagMode === 'rl');
          const fyFn = getFFn(['td', 'bu'].indexOf(state.dagMode) !== -1, state.dagMode === 'td');
          const fzFn = getFFn(['zin', 'zout'].indexOf(state.dagMode) !== -1, state.dagMode === 'zout');

          state.graphData.nodes.forEach(node => {
            node.fx = fxFn(node);
            node.fy = fyFn(node);
            node.fz = fzFn(node);
          });
        };

        // Use radial force for radial dags
        state.d3ForceLayout.force('dagRadial',
          ['radialin', 'radialout'].indexOf(state.dagMode) !== -1
            ? d3ForceRadial(node => {
                const nodeDepth = nodeDepths[node[state.nodeId]];
                return (state.dagMode === 'radialin' ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
              })
              .strength(1)
            : null
        );
      } else {
        // ngraph
        const graph = ngraph.graph();
        state.graphData.nodes.forEach(node => { graph.addNode(node[state.nodeId]); });
        state.graphData.links.forEach(link => { graph.addLink(link.source, link.target); });
        layout = ngraph['forcelayout' + (state.numDimensions === 2 ? '' : '3d')](graph);
        layout.graph = graph; // Attach graph reference to layout
      }

      for (let i = 0; i < state.warmupTicks; i++) { layout[isD3Sim ? 'tick' : 'step'](); } // Initial ticks before starting to render

      state.layout = layout;
      this.resetCountdown();

      state.onFinishLoading();
    }

    state.engineRunning = true; // resume simulation
  }
});
