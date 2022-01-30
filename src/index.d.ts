import { Object3D, Material } from 'three';

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

type NodeObject = object & {
  id?: string | number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};

type LinkObject = object & {
  source?: string | number | NodeObject;
  target?: string | number | NodeObject;
};

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type NodeAccessor<T> = Accessor<NodeObject, T>;
type LinkAccessor<T> = Accessor<LinkObject, T>;

type DagMode = 'td' | 'bu' | 'lr' | 'rl' | 'zout' | 'zin' | 'radialout' | 'radialin';

type ForceEngine = 'd3' | 'ngraph';

interface ForceFn {
  (alpha: number): void;
  initialize?: (nodes: NodeObject[], ...args: any[]) => void;
  [key: string]: any;
}

type Coords = { x: number; y: number; z: number; }

type LinkPositionUpdateFn = (obj: Object3D, coords: { start: Coords, end: Coords }, link: LinkObject) => null | boolean;

export declare class ThreeForceGraphGeneric<ChainableInstance> extends Object3D {
  constructor();

  // Data input
  graphData(): GraphData;
  graphData(data: GraphData): ChainableInstance;
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
  nodeVal(): NodeAccessor<number>;
  nodeVal(valAccessor: NodeAccessor<number>): ChainableInstance;
  nodeVisibility(): NodeAccessor<boolean>;
  nodeVisibility(visibilityAccessor: NodeAccessor<boolean>): ChainableInstance;
  nodeColor(): NodeAccessor<string>;
  nodeColor(colorAccessor: NodeAccessor<string>): ChainableInstance;
  nodeAutoColorBy(): NodeAccessor<string | null>;
  nodeAutoColorBy(colorByAccessor: NodeAccessor<string | null>): ChainableInstance;
  nodeOpacity(): number;
  nodeOpacity(opacity: number): ChainableInstance;
  nodeResolution(): number;
  nodeResolution(resolution: number): ChainableInstance;
  nodeThreeObject(): NodeAccessor<Object3D>;
  nodeThreeObject(objAccessor: NodeAccessor<Object3D>): ChainableInstance;
  nodeThreeObjectExtend(): NodeAccessor<boolean>;
  nodeThreeObjectExtend(extendAccessor: NodeAccessor<boolean>): ChainableInstance;

  // Link styling
  linkVisibility(): LinkAccessor<boolean>;
  linkVisibility(visibilityAccessor: LinkAccessor<boolean>): ChainableInstance;
  linkColor(): LinkAccessor<string>;
  linkColor(colorAccessor: LinkAccessor<string>): ChainableInstance;
  linkAutoColorBy(): LinkAccessor<string | null>;
  linkAutoColorBy(colorByAccessor: LinkAccessor<string | null>): ChainableInstance;
  linkOpacity(): number;
  linkOpacity(opacity: number): ChainableInstance;
  linkWidth(): LinkAccessor<number>;
  linkWidth(widthAccessor: LinkAccessor<number>): ChainableInstance;
  linkResolution(): number;
  linkResolution(resolution: number): ChainableInstance;
  linkCurvature(): LinkAccessor<number>;
  linkCurvature(curvatureAccessor: LinkAccessor<number>): ChainableInstance;
  linkCurveRotation(): LinkAccessor<number>;
  linkCurveRotation(curveRotationAccessor: LinkAccessor<number>): ChainableInstance;
  linkMaterial(): LinkAccessor<Material | boolean | null>;
  linkMaterial(materialAccessor: LinkAccessor<Material | boolean | null>): ChainableInstance;
  linkThreeObject(): LinkAccessor<Object3D>;
  linkThreeObject(objAccessor: LinkAccessor<Object3D>): ChainableInstance;
  linkThreeObjectExtend(): LinkAccessor<boolean>;
  linkThreeObjectExtend(extendAccessor: LinkAccessor<boolean>): ChainableInstance;
  linkPositionUpdate(): LinkPositionUpdateFn | null;
  linkPositionUpdate(updateFn: LinkPositionUpdateFn): ChainableInstance;
  linkDirectionalArrowLength(): LinkAccessor<number>;
  linkDirectionalArrowLength(lengthAccessor: LinkAccessor<number>): ChainableInstance;
  linkDirectionalArrowColor(): LinkAccessor<string>;
  linkDirectionalArrowColor(colorAccessor: LinkAccessor<string>): ChainableInstance;
  linkDirectionalArrowRelPos(): LinkAccessor<number>;
  linkDirectionalArrowRelPos(fractionAccessor: LinkAccessor<number>): ChainableInstance;
  linkDirectionalArrowResolution(): number;
  linkDirectionalArrowResolution(resolution: number): ChainableInstance;
  linkDirectionalParticles(): LinkAccessor<number>;
  linkDirectionalParticles(numParticlesAccessor: LinkAccessor<number>): ChainableInstance;
  linkDirectionalParticleSpeed(): LinkAccessor<number>;
  linkDirectionalParticleSpeed(relDistancePerFrameAccessor: LinkAccessor<number>): ChainableInstance;
  linkDirectionalParticleWidth(): LinkAccessor<number>;
  linkDirectionalParticleWidth(widthAccessor: LinkAccessor<number>): ChainableInstance;
  linkDirectionalParticleColor(): LinkAccessor<string>;
  linkDirectionalParticleColor(colorAccessor: LinkAccessor<string>): ChainableInstance;
  linkDirectionalParticleResolution(): number;
  linkDirectionalParticleResolution(resolution: number): ChainableInstance;
  emitParticle(link: LinkObject): ChainableInstance;

  // Force engine configuration
  forceEngine(): ForceEngine;
  forceEngine(engine: ForceEngine): ChainableInstance;
  numDimensions(): 1 | 2 | 3;
  numDimensions(dimensions: 1 | 2 | 3): ChainableInstance;
  dagMode(): DagMode;
  dagMode(mode: DagMode): ChainableInstance;
  dagLevelDistance(): number | null;
  dagLevelDistance(distance: number): ChainableInstance;
  dagNodeFilter(): (node: NodeObject) => boolean;
  dagNodeFilter(filterFn: (node: NodeObject) => boolean): ChainableInstance;
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
  d3Force(forceName: 'link' | 'charge' | 'center' | string): ForceFn | undefined;
  d3Force(forceName: 'link' | 'charge' | 'center' | string, forceFn: ForceFn): ChainableInstance;
  d3ReheatSimulation(): ChainableInstance;
  ngraphPhysics(physics: object): ChainableInstance;
  warmupTicks(): number;
  warmupTicks(ticks: number): ChainableInstance;
  cooldownTicks(): number;
  cooldownTicks(ticks: number): ChainableInstance;
  cooldownTime(): number;
  cooldownTime(milliseconds: number): ChainableInstance;

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
  getGraphBbox(nodeFilter?: (node: NodeObject) => boolean): { x: [number, number], y: [number, number], z: [number,number] };
}

declare class ThreeForceGraph extends ThreeForceGraphGeneric<ThreeForceGraph> {}

export default ThreeForceGraph;
