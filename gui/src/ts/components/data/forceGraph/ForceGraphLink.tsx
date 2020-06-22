import * as React from "react";
import {ForceGraphLinkPosition} from "models/data/forceGraph";

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
  NodeDatum extends d3.SimulationNodeDatum,
  LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
>({
  link,
  ...props
}: ForceGraphLinkProps<LinkDatum>) => {
  return <line {...defaultLinkOptions} {...props} />;
};
