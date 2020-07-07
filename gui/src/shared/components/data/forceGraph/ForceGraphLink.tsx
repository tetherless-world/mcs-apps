import * as React from "react";
import {
  ForceGraphLinkDatum,
  ForceGraphNodeDatum,
} from "shared/models/data/forceGraph";

const defaultLinkOptions: React.SVGProps<SVGLineElement> = {
  stroke: "#999",
  strokeOpacity: 0.6,
  strokeWidth: 1,
};

export type ForceGraphLinkProps<LinkDatum> = React.SVGProps<SVGLineElement> & {
  link: LinkDatum;
  showLabel?: boolean;
  labelOpacity?: number;
};

export const ForceGraphLink = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  link,
  opacity,
  onClick,
  fontSize: userDefinedFontSize,
  labelOpacity: userDefinedLabelOpacity,
  showLabel,
  ...props
}: ForceGraphLinkProps<LinkDatum>) => {
  const fontSize = userDefinedFontSize ?? 10;
  const labelOpacity = userDefinedLabelOpacity ?? opacity ?? 1;

  return (
    <g id={link.id} className="link" opacity={opacity} onClick={onClick}>
      <line {...defaultLinkOptions} {...props} />

      {showLabel && (
        <>
          {labelOpacity > 0.8 && (
            <text fontSize={fontSize} stroke="white" strokeWidth={2}>
              {link.label}
            </text>
          )}
          <text fontSize={fontSize} fillOpacity={labelOpacity}>
            {link.label}
          </text>
        </>
      )}
    </g>
  );
};
