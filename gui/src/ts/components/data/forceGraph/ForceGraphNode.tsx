import * as React from "react";

import {
  ForceGraphNodeDatum,
  ForceGraphNodePosition,
} from "models/data/forceGraph";

const defaultNodeOptions: React.SVGProps<SVGCircleElement> = {
  // stroke: "#fff",
  // strokeWidth: 2,
  stroke: "none",
  r: 10,
  fill: "#808080",
  opacity: 1,
};

export type ForceGraphNodeProps<NodeDatum> = React.SVGProps<SVGCircleElement> &
  Partial<ForceGraphNodePosition> & {
    node: NodeDatum;
  };

export const ForceGraphNode = <NodeDatum extends ForceGraphNodeDatum>({
  node,
  ...props
}: ForceGraphNodeProps<NodeDatum>) => {
  const {cx, cy, r} = props;
  return (
    <React.Fragment>
      <circle {...defaultNodeOptions} {...props} />
      {cx && cy && (
        <React.Fragment>
          <text x={cx} y={cy} fontSize={r || 10} strokeWidth={2} stroke="white">
            {node.label}
          </text>
          <text x={cx} y={cy} fontSize={r || 10}>
            {node.label}
          </text>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
