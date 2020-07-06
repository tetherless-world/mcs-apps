import * as React from "react";

import {ForceGraphLinkProps, ForceGraphLink} from "./ForceGraphLink";
import {ForceGraphNodeDatum, ForceGraphLinkDatum} from "models/data/forceGraph";

interface ForceGraphArrowLinkProps<LinkDatum>
  extends ForceGraphLinkProps<LinkDatum> {
  targetRadius?: number;
}

export const ForceGraphArrowLink = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  link,
  targetRadius: definedTargetRadius,
  ...linkProps
}: ForceGraphArrowLinkProps<LinkDatum>) => {
  const id = `${link.id}-link-arrow`;
  const targetRadius = definedTargetRadius || 2;
  const fill = linkProps.stroke || linkProps.color || "#999";

  return (
    <React.Fragment>
      <defs>
        <marker
          viewBox="-0 -5 10 10"
          id={id}
          markerWidth={13}
          markerHeight={13}
          refX={13 + targetRadius / 2}
          refY={0}
          orient="auto"
        >
          <path
            d="M 0,-5 L 10 ,0 L 0,5"
            fill={fill}
            fillOpacity={linkProps.strokeOpacity}
          />
        </marker>
      </defs>

      <ForceGraphLink {...linkProps} link={link} markerEnd={`url(#${id})`} />
    </React.Fragment>
  );
};
