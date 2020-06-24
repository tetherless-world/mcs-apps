import * as React from "react";
import {ForceGraphLinkDatum, ForceGraphNodeDatum} from "models/data/forceGraph";

const defaultLinkOptions: React.SVGProps<SVGLineElement> = {
  stroke: "#999",
  strokeOpacity: 0.6,
  strokeWidth: 1,
};

export type ForceGraphLinkProps<LinkDatum> = React.SVGProps<SVGLineElement> & {
  link: LinkDatum;
};

export const ForceGraphLink = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  link,
  opacity,
  onClick,
  fontSize: userDefinedFontSize,
  ...props
}: ForceGraphLinkProps<LinkDatum>) => {
  const fontSize = userDefinedFontSize ?? 10;

  return (
    <g id={link.id} className="link" opacity={opacity} onClick={onClick}>
      <line {...defaultLinkOptions} {...props} />

      <text fontSize={fontSize} stroke="white" strokeWidth={2}>
        {link.label}
      </text>
      <text fontSize={fontSize}>{link.label}</text>
    </g>
  );
};
