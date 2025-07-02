import { Object3D, Material } from 'three';

export interface GraphData<N = NodeObject, L = LinkObject<N>> {
  nodes: N[];
  links: L[];
}

export type NodeObject = object & {
  /**
   *  Node id
   */
  id?: string | number;

  /**
   * The node’s zero-based index into *nodes*
   */
  index?: number;

  /**
   * The node’s current *x*-position.
   * This value may be subsequently modified by forces and by the simulation.
   * If it is *NaN*, the position is initialized in a 3D [phyllotaxis arrangement](https://observablehq.com/@d3/force-layout-phyllotaxis) arrangement,
   * so chosen to ensure a deterministic, uniform distribution around the origin.
   */
  x?: number;
  /**
   * The node’s current *y*-position.
   * This value may be subsequently modified by forces and by the simulation.
   * If it is *NaN*, the position is initialized in a 3D [phyllotaxis arrangement](https://observablehq.com/@d3/force-layout-phyllotaxis) arrangement,
   * so chosen to ensure a deterministic, uniform distribution around the origin.
   */
  y?: number;
  /**
   * The node’s current *z*-position.
   * This value may be subsequently modified by forces and by the simulation.
   * If it is *NaN*, the position is initialized in a 3D [phyllotaxis arrangement](https://observablehq.com/@d3/force-layout-phyllotaxis) arrangement,
   * so chosen to ensure a deterministic, uniform distribution around the origin.
   */
  z?: number;

  /**
  * The node’s current *x*-velocity.
  * This value may be subsequently modified by forces and by the simulation.
  * @default 0
  */
  vx?: number;
  /**
  * The node’s current *y*-velocity.
  * This value may be subsequently modified by forces and by the simulation.
  * @default 0
  */
  vy?: number;
  /**
  * The node’s current *z*-velocity.
  * This value may be subsequently modified by forces and by the simulation.
  * @default 0
  */
  vz?: number;

  /**
   * The node’s fixed *x*-position.
   * At the end of each tick, after the application of any forces, a node with a defined *node*.fx has *node*.x reset to this value and *node*.vx set to zero.
   * To unfix a node that was previously fixed, set *node*.fx to null, or delete this property.
   * @default undefined
  */
  fx?: number;
  /**
   * The node’s fixed *y*-position.
   * At the end of each tick, after the application of any forces, a node with a defined *node*.fy has *node*.y reset to this value and *node*.vy set to zero.
   * To unfix a node that was previously fixed, set *node*.fy to null, or delete this property.
   * @default undefined
  */
  fy?: number;
  /**
   * The node’s fixed *z*-position.
   * At the end of each tick, after the application of any forces, a node with a defined *node*.fz has *node*.z reset to this value and *node*.vz set to zero.
   * To unfix a node that was previously fixed, set *node*.fz to null, or delete this property.
   * @default undefined
  */
  fz?: number;
};

export type LinkObject<N = NodeObject> = object & {
  /**
   * The link’s source node.
   * When the link force is initialized (or re-initialized, as when the nodes or links change), any *link*.source property which is *not* an object is replaced by an object reference to
   * the corresponding *node* with the given identifier.
   */
  source?: string | number | N;

  /**
   * The link’s target node.
   * When the link force is initialized (or re-initialized, as when the nodes or links change), any *link*.target property which is *not* an object is replaced by an object reference to
   * the corresponding *node* with the given identifier.
   */
  target?: string | number | N;

  /**
   * The zero-based index into links
   */
  index?: number;
};

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type NodeAccessor<T, N> = Accessor<N, T>;
type LinkAccessor<T, N, L> = Accessor<L, T>;

type DagMode = 'td' | 'bu' | 'lr' | 'rl' | 'zout' | 'zin' | 'radialout' | 'radialin';

type ForceEngine = 'd3' | 'ngraph';

interface ForceFn<N = NodeObject> {
  (alpha: number): void;
  initialize?: (nodes: N[], ...args: any[]) => void;
  [key: string]: any;
}

type Coords = { x: number; y: number; z: number; }

type NodePositionUpdateFn<N> = (obj: Object3D, coords: Coords, node: N) => void | null | boolean;
type LinkPositionUpdateFn<L> = (obj: Object3D, coords: { start: Coords, end: Coords }, link: L) => void | null | boolean;

export declare class ThreeForceGraphGeneric<ChainableInstance, N extends NodeObject = NodeObject, L extends LinkObject<N> = LinkObject<N>> extends Object3D {
  constructor();

  // Data input
  graphData(): GraphData<N, L>;
  graphData(data: GraphData<N, L>): ChainableInstance;
  jsonUrl(): string | null;
  jsonUrl(url: string | null): ChainableInstance;
  nodeId(): string;
  nodeId(id: string): ChainableInstance;
  linkSource(): string;
  linkSource(source: string): ChainableInstance;
  linkTarget(): string;
  linkTarget(target: string): ChainableInstance;

  // Node styling
  nodeRelSize(): number;
  nodeRelSize(size: number): ChainableInstance;
  nodeVal(): NodeAccessor<number, N>;
  nodeVal(valAccessor: NodeAccessor<number, N>): ChainableInstance;
  nodeVisibility(): NodeAccessor<boolean, N>;
  nodeVisibility(visibilityAccessor: NodeAccessor<boolean, N>): ChainableInstance;
  nodeColor(): NodeAccessor<string, N>;
  nodeColor(colorAccessor: NodeAccessor<string, N>): ChainableInstance;
  nodeAutoColorBy(): NodeAccessor<string | null, N>;
  nodeAutoColorBy(colorByAccessor: NodeAccessor<string | null, N>): ChainableInstance;
  nodeOpacity(): number;
  nodeOpacity(opacity: number): ChainableInstance;
  nodeResolution(): number;
  nodeResolution(resolution: number): ChainableInstance;
  nodeThreeObject(): NodeAccessor<Object3D, N>;
  nodeThreeObject(objAccessor: NodeAccessor<Object3D, N>): ChainableInstance;
  nodeThreeObjectExtend(): NodeAccessor<boolean, N>;
  nodeThreeObjectExtend(extendAccessor: NodeAccessor<boolean, N>): ChainableInstance;
  nodePositionUpdate(): NodePositionUpdateFn<N> | null;
  nodePositionUpdate(updateFn: NodePositionUpdateFn<N>): ChainableInstance;

  // Link styling
  linkVisibility(): LinkAccessor<boolean, N, L>;
  linkVisibility(visibilityAccessor: LinkAccessor<boolean, N, L>): ChainableInstance;
  linkColor(): LinkAccessor<string, N, L>;
  linkColor(colorAccessor: LinkAccessor<string, N, L>): ChainableInstance;
  linkAutoColorBy(): LinkAccessor<string | null, N, L>;
  linkAutoColorBy(colorByAccessor: LinkAccessor<string | null, N, L>): ChainableInstance;
  linkOpacity(): number;
  linkOpacity(opacity: number): ChainableInstance;
  linkWidth(): LinkAccessor<number, N, L>;
  linkWidth(widthAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkResolution(): number;
  linkResolution(resolution: number): ChainableInstance;
  linkCurvature(): LinkAccessor<number, N, L>;
  linkCurvature(curvatureAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkCurveRotation(): LinkAccessor<number, N, L>;
  linkCurveRotation(curveRotationAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkMaterial(): LinkAccessor<Material | boolean | null, N, L>;
  linkMaterial(materialAccessor: LinkAccessor<Material | boolean | null, N, L>): ChainableInstance;
  linkThreeObject(): LinkAccessor<Object3D, N, L>;
  linkThreeObject(objAccessor: LinkAccessor<Object3D, N, L>): ChainableInstance;
  linkThreeObjectExtend(): LinkAccessor<boolean, N, L>;
  linkThreeObjectExtend(extendAccessor: LinkAccessor<boolean, N, L>): ChainableInstance;
  linkPositionUpdate(): LinkPositionUpdateFn<L> | null;
  linkPositionUpdate(updateFn: LinkPositionUpdateFn<L>): ChainableInstance;
  linkDirectionalArrowLength(): LinkAccessor<number, N, L>;
  linkDirectionalArrowLength(lengthAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkDirectionalArrowColor(): LinkAccessor<string, N, L>;
  linkDirectionalArrowColor(colorAccessor: LinkAccessor<string, N, L>): ChainableInstance;
  linkDirectionalArrowRelPos(): LinkAccessor<number, N, L>;
  linkDirectionalArrowRelPos(fractionAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkDirectionalArrowResolution(): number;
  linkDirectionalArrowResolution(resolution: number): ChainableInstance;
  linkDirectionalParticles(): LinkAccessor<number, N, L>;
  linkDirectionalParticles(numParticlesAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkDirectionalParticleSpeed(): LinkAccessor<number, N, L>;
  linkDirectionalParticleSpeed(relDistancePerFrameAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkDirectionalParticleWidth(): LinkAccessor<number, N, L>;
  linkDirectionalParticleWidth(widthAccessor: LinkAccessor<number, N, L>): ChainableInstance;
  linkDirectionalParticleColor(): LinkAccessor<string, N, L>;
  linkDirectionalParticleColor(colorAccessor: LinkAccessor<string, N, L>): ChainableInstance;
  linkDirectionalParticleResolution(): number;
  linkDirectionalParticleResolution(resolution: number): ChainableInstance;
  linkDirectionalParticleThreeObject(): LinkAccessor<Object3D, N, L>;
  linkDirectionalParticleThreeObject(object: LinkAccessor<Object3D, N, L>): ChainableInstance;
  emitParticle(link: L): ChainableInstance;

  // Force engine configuration
  forceEngine(): ForceEngine;
  forceEngine(engine: ForceEngine): ChainableInstance;
  numDimensions(): 1 | 2 | 3;
  numDimensions(dimensions: 1 | 2 | 3): ChainableInstance;
  dagMode(): DagMode;
  dagMode(mode: DagMode): ChainableInstance;
  dagLevelDistance(): number | null;
  dagLevelDistance(distance: number): ChainableInstance;
  dagNodeFilter(): (node: N) => boolean;
  dagNodeFilter(filterFn: (node: N) => boolean): ChainableInstance;
  onDagError(): (loopNodeIds: (string | number)[]) => void;
  onDagError(errorHandleFn: (loopNodeIds: (string | number)[]) => void): ChainableInstance;
  d3AlphaMin(): number;
  d3AlphaMin(alphaMin: number): ChainableInstance;
  d3AlphaDecay(): number;
  d3AlphaDecay(alphaDecay: number): ChainableInstance;
  d3AlphaTarget(): number;
  d3AlphaTarget(alphaTarget: number): ChainableInstance;
  d3VelocityDecay(): number;
  d3VelocityDecay(velocityDecay: number): ChainableInstance;
  d3Force(forceName: 'link' | 'charge' | 'center' | string): ForceFn<N> | undefined;
  d3Force(forceName: 'link' | 'charge' | 'center' | string, forceFn: ForceFn<N> | null): ChainableInstance;
  d3ReheatSimulation(): ChainableInstance;
  ngraphPhysics(physics: object): ChainableInstance;
  warmupTicks(): number;
  warmupTicks(ticks: number): ChainableInstance;
  cooldownTicks(): number;
  cooldownTicks(ticks: number): ChainableInstance;
  cooldownTime(): number;
  cooldownTime(milliseconds: number): ChainableInstance;
  resetCountdown(): ChainableInstance;

  // Lifecycle methods
  onEngineTick(callback: () => void): ChainableInstance;
  onEngineStop(callback: () => void): ChainableInstance;
  onLoading(callback: () => void): ChainableInstance;
  onFinishLoading(callback: () => void): ChainableInstance;
  onUpdate(callback: () => void): ChainableInstance;
  onFinishUpdate(callback: () => void): ChainableInstance;
  tickFrame(): ChainableInstance;
  resetProps(): ChainableInstance;
  refresh(): ChainableInstance;

  // Utilities
  getGraphBbox(nodeFilter?: (node: N) => boolean): { x: [number, number], y: [number, number], z: [number,number] };
}

declare class ThreeForceGraph<NodeType = NodeObject, LinkType = LinkObject<NodeType>> extends ThreeForceGraphGeneric<ThreeForceGraph<NodeType, LinkType>, NodeType, LinkType> {}

export default ThreeForceGraph;
