import * as React from "react";
import {
  ForceGraphLinkPosition,
  ForceGraphLinkDatum,
  ForceGraphNodeDatum,
} from "models/data/forceGraph";

const defaultLinkOptions: React.SVGProps<SVGLineElement> = {
  stroke: "#999",
  strokeOpacity: 0.6,
  strokeWidth: 1,
};

export type ForceGraphLinkProps<LinkDatum> = React.SVGProps<SVGLineElement> &
  Partial<ForceGraphLinkPosition> & {
    link: LinkDatum;
  };

export const ForceGraphLink = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  link,
  ...props
}: ForceGraphLinkProps<LinkDatum>) => {
  const {x1, y1, x2, y2} = props;

  return (
    <React.Fragment>
      <line {...defaultLinkOptions} {...props} />
      {x1 && x2 && y1 && y2 && (
        <React.Fragment>
          <text
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2}
            fontSize={10}
            stroke="white"
            strokeWidth={2}
          >
            {link.label}
          </text>
          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} fontSize={10}>
            {link.label}
          </text>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
