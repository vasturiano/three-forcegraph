# ThreeJS Force-Directed Graph

[![NPM](https://nodei.co/npm/three-forcegraph.png?compact=true)](https://nodei.co/npm/three-forcegraph/)

<p align="center">
     <a href="http://bl.ocks.org/vasturiano/02affe306ce445e423f992faeea13521"><img width="80%" src="http://gist.github.com/vasturiano/02affe306ce445e423f992faeea13521/raw/preview.png"></a>
</p>

A [ThreeJS](https://threejs.org/) WebGL class to represent a graph data structure in a 3-dimensional space using a force-directed iterative layout.
Uses either [d3-force-3d](https://github.com/vasturiano/d3-force-3d) or [ngraph](https://github.com/anvaka/ngraph.forcelayout3d) for the underlying physics engine.

## Quick start

```
import ThreeForceGraph from 'three-forcegraph';
```
or
```
var ThreeForceGraph = require('three-forcegraph');
```
or even
```
<script src="//unpkg.com/three-forcegraph"></script>
```
then
```
var myGraph = new ThreeForceGraph()
    .graphData(<myData>);

var myScene = new THREE.Scene();
myScene.add(myGraph);

...

// on animation frame
myGraph.tickFrame();
```

## API reference

| Method | Description | Default |
| --- | --- | :--: |
| <b>graphData</b>([<i>data</i>]) | Getter/setter for graph data structure (see below for syntax details). Can also be used to apply [incremental updates](https://bl.ocks.org/vasturiano/2f602ea6c51c664c29ec56cbe2d6a5f6). | `{ nodes: [], links: [] }` |
| <b>jsonUrl</b>([<i>url</i>]) | URL of JSON file to load graph data directly from, as an alternative to specifying <i>graphData</i> directly. | |
| <b>numDimensions</b>([<i>int</i>]) | Getter/setter for number of dimensions to run the force simulation on (1, 2 or 3). | 3 |
| <b>nodeRelSize</b>([<i>num</i>]) | Getter/setter for the ratio of node sphere volume (cubic px) per value unit. | 4 |
| <b>nodeId</b>([<i>str</i>]) | Node object accessor attribute for unique node id (used in link objects source/target). | `id` |
| <b>nodeVal</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Node object accessor function, attribute or a numeric constant for the node numeric value (affects sphere volume). | `val` |
| <b>nodeResolution</b>([<i>num</i>]) | Getter/setter for the geometric resolution of each node, expressed in how many slice segments to divide the circumference. Higher values yield smoother spheres. | 8 |
| <b>nodeColor</b>([<i>str</i> or <i>fn</i>]) | Node object accessor function or attribute for node color (affects sphere color). | `color` |
| <b>nodeAutoColorBy</b>([<i>str</i> or <i>fn</i>]) | Node object accessor function (`fn(node)`) or attribute (e.g. `'type'`) to automatically group colors by. Only affects nodes without a color attribute. | |
| <b>nodeOpacity</b>([<i>num</i>]) | Getter/setter for all the nodes sphere opacity, between [0,1]. | 0.75   |
| <b>nodeThreeObject</b>([<i>Object3d</i>, <i>str</i> or <i>fn</i>]) | Node object accessor function or attribute for generating a custom 3d object to render as graph nodes. Should return an instance of [ThreeJS Object3d](https://threejs.org/docs/index.html#api/core/Object3D). If a <i>falsy</i> value is returned, the default 3d object type will be used instead for that node.  | *default node object is a sphere, sized according to `val` and styled according to `color`.* |
| <b>linkSource</b>([<i>str</i>]) | Link object accessor attribute referring to id of source node. | `source` |
| <b>linkTarget</b>([<i>str</i>]) | Link object accessor attribute referring to id of target node. | `target` |
| <b>linkVisibility</b>([<i>boolean</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a boolean constant for line visibility. A value of `false` keeps force without drawing link. | `true` |
| <b>linkColor</b>([<i>str</i> or <i>fn</i>]) | Link object accessor function or attribute for line color. | `color` |
| <b>linkAutoColorBy</b>([<i>str</i> or <i>fn</i>]) | Link object accessor function (`fn(link)`) or attribute (e.g. `'type'`) to automatically group colors by. Only affects links without a color attribute. | |
| <b>linkOpacity</b>([<i>num</i>]) | Getter/setter for line opacity of all the links, between [0,1]. | 0.2 |
| <b>linkWidth</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the link line width. A value of zero will render a [ThreeJS Line](https://threejs.org/docs/#api/objects/Line) whose width is constant (`1px`) regardless of distance. Values are rounded to the nearest decimal for indexing purposes. | 0 |
| <b>linkResolution</b>([<i>num</i>]) | Getter/setter for the geometric resolution of each link, expressed in how many radial segments to divide the cylinder. Higher values yield smoother cylinders. Applicable only to links with positive width. | 6 |
| <b>linkCurvature</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the curvature radius of the link line. Only applicable to links using [ThreeJS Line](https://threejs.org/docs/#api/objects/Line) (`0` width). Curved lines are represented as 3D bezier curves, and any numeric value is accepted. A value of `0` renders a straight line. `1` indicates a radius equal to half of the line length, causing the curve to approximate a semi-circle. For self-referencing links (`source` equal to `target`) the curve is represented as a loop around the node, with length proportional to the curvature value. Lines are curved clockwise for positive values, and counter-clockwise for negative values. Note that rendering curved lines is purely a visual effect and does not affect the behavior of the underlying forces. | 0 |
| <b>linkCurveRotation</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the rotation along the line axis to apply to the curve. Has no effect on straight lines. At `0` rotation, the curve is oriented in the direction of the intersection with the `XY` plane. The rotation angle (in radians) will rotate the curved line clockwise around the "start-to-end" axis from this reference orientation. | 0 |
| <b>linkMaterial</b>([<i>Material</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function or attribute for specifying a custom material to style the graph links with. Should return an instance of [ThreeJS Material](https://threejs.org/docs/#api/materials/Material). If a <i>falsy</i> value is returned, the default material will be used instead for that link. | *default link material is [MeshLambertMaterial](https://threejs.org/docs/#api/materials/MeshLambertMaterial) styled according to `color` and `opacity`.* |
| <b>linkDirectionalArrowLength</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the length of the arrow head indicating the link directionality. The arrow is displayed directly over the link line, and points in the direction of `source` > `target`. A value of `0` hides the arrow. | 0 |
| <b>linkDirectionalArrowColor</b>([<i>str</i> or <i>fn</i>]) | Link object accessor function or attribute for the color of the arrow head. | `color` |
| <b>linkDirectionalArrowRelPos</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the longitudinal position of the arrow head along the link line, expressed as a ratio between `0` and `1`, where `0` indicates immediately next to the `source` node, `1` next to the `target` node, and `0.5` right in the middle. | 0.5 |
| <b>linkDirectionalArrowResolution</b>([<i>num</i>]) | Getter/setter for the geometric resolution of the arrow head, expressed in how many slice segments to divide the cone base circumference. Higher values yield smoother arrows. | 8 |
| <b>linkDirectionalParticles</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the number of particles (small spheres) to display over the link line. The particles are distributed equi-spaced along the line, travel in the direction `source` > `target`, and can be used to indicate link directionality. | 0 |
| <b>linkDirectionalParticleSpeed</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the directional particles speed, expressed as the ratio of the link length to travel per frame. Values above `0.5` are discouraged. | 0.01 |
| <b>linkDirectionalParticleWidth</b>([<i>num</i>, <i>str</i> or <i>fn</i>]) | Link object accessor function, attribute or a numeric constant for the directional particles width. Values are rounded to the nearest decimal for indexing purposes. | 0.5 |
| <b>linkDirectionalParticleColor</b>([<i>str</i> or <i>fn</i>]) | Link object accessor function or attribute for the directional particles color. | `color` |
| <b>linkDirectionalParticleResolution</b>([<i>num</i>]) | Getter/setter for the geometric resolution of each directional particle, expressed in how many slice segments to divide the circumference. Higher values yield smoother particles. | 4 |
| <b>forceEngine</b>([<i>str</i>]) | Getter/setter for which force-simulation engine to use ([*d3*](https://github.com/vasturiano/d3-force-3d) or [*ngraph*](https://github.com/anvaka/ngraph.forcelayout)). | `d3` |
| <b>d3AlphaDecay</b>([<i>num</i>]) | Getter/setter for the [simulation intensity decay](https://github.com/vasturiano/d3-force-3d#simulation_alphaDecay) parameter, only applicable if using the d3 simulation engine. | `0.0228` |
| <b>d3VelocityDecay</b>([<i>num</i>]) | Getter/setter for the nodes' [velocity decay](https://github.com/vasturiano/d3-force-3d#simulation_velocityDecay) that simulates the medium resistance, only applicable if using the d3 simulation engine. | `0.4` |
| <b>d3Force</b>(<i>str</i>, [<i>fn</i>]) | Getter/setter for the internal forces that control the d3 simulation engine. Follows the same interface as `d3-force-3d`'s [simulation.force](https://github.com/vasturiano/d3-force-3d#simulation_force). Three forces are included by default: `'link'` (based on [forceLink](https://github.com/vasturiano/d3-force-3d#forceLink)), `'charge'` (based on [forceManyBody](https://github.com/vasturiano/d3-force-3d#forceManyBody)) and `'center'` (based on [forceCenter](https://github.com/vasturiano/d3-force-3d#forceCenter)). Each of these forces can be reconfigured, or new forces can be added to the system. This method is only applicable if using the d3 simulation engine. | |
| <b>warmupTicks</b>([<i>int</i>]) | Getter/setter for number of layout engine cycles to dry-run at ignition before starting to render. | 0 |
| <b>cooldownTicks</b>([<i>int</i>]) | Getter/setter for how many build-in frames to render before stopping and freezing the layout engine. | Infinity |
| <b>cooldownTime</b>([<i>num</i>]) | Getter/setter for how long (ms) to render for before stopping and freezing the layout engine. | 15000 |
| <b>onEngineTick</b>(<i>fn</i>) | Callback function invoked at every tick of the simulation engine. | - |
| <b>onEngineStop</b>(<i>fn</i>) | Callback function invoked when the simulation engine stops and the layout is frozen. | - |
| <b>onLoading</b>(<i>fn</i>) | Callback function for notification that data is being loaded, and the simulation engine is temporarily paused. | - |
| <b>onFinishLoading</b>(<i>fn</i>) | Callback function for notification that the component has finished loading data and iterating through the warmup phase, and the simulation engine has been resumed. | - |
| <b>tickFrame()</b> | This method should be called on each cycle of the global renderer to iterate the underlying force simulation engine and update the nodes/links objects' positions. ||
| <b>resetProps()</b> | Reset all object properties to their default value. ||

### Input JSON syntax

```
{
    "nodes": [
        {
            "id": "id1",
            "name": "name1",
            "val": 1
        },
        {
            "id": "id2",
            "name": "name2",
            "val": 10
        },
        (...)
    ],
    "links": [
        {
            "source": "id1",
            "target": "id2"
        },
        (...)
    ]
}
```
