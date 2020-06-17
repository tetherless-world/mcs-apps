import * as React from "react";
import * as d3 from "d3";

const defaultNodeOptions: React.SVGProps<SVGCircleElement> = {
  stroke: "#fff",
  strokeWidth: 2,
  r: 10,
  fill: "#808080",
  opacity: 1,
};

export type ForceGraphNodeProps<
  NodeDatum extends d3.SimulationNodeDatum
> = React.SVGProps<SVGCircleElement> & {
  node: NodeDatum;
};

export const ForceGraphNode = <NodeDatum extends d3.SimulationNodeDatum>({
  node,
  ...props
}: ForceGraphNodeProps<NodeDatum>) => (
  <circle {...defaultNodeOptions} {...props} />
);
