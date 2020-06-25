import * as React from "react";

import {ForceGraphNodeDatum} from "models/data/forceGraph";

const defaultNodeOptions: React.SVGProps<SVGCircleElement> = {
  stroke: "none",
  fill: "#808080",
  opacity: 1,
};

export type ForceGraphNodeProps<NodeDatum> = React.SVGProps<
  SVGCircleElement
> & {
  node: NodeDatum;
  showLabel?: boolean;
  labelOpacity?: number;
};

export const ForceGraphNode = <NodeDatum extends ForceGraphNodeDatum>({
  node,
  opacity,
  cursor,
  onClick,
  fontSize: userDefinedFontSize,
  r,
  showLabel,
  labelOpacity: userDefinedLabelOpacity,
  ...props
}: ForceGraphNodeProps<NodeDatum>) => {
  const radius = r ?? 10;
  const fontSize = userDefinedFontSize ?? radius;
  const labelOpacity = userDefinedLabelOpacity ?? opacity ?? 1;

  return (
    <g
      id={node.id}
      className="node"
      opacity={opacity}
      cursor={cursor}
      onClick={onClick}
    >
      <circle {...defaultNodeOptions} {...props} r={radius} />

      {showLabel && (
        <>
          {labelOpacity > 0.8 && (
            <text fontSize={fontSize} strokeWidth={2} stroke="white">
              {node.label}
            </text>
          )}

          <text fontSize={fontSize} fillOpacity={labelOpacity}>
            {node.label}
          </text>
        </>
      )}
    </g>
  );
};
