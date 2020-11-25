import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import {Chip, ChipProps} from "@material-ui/core";
import * as d3 from "d3";

const colors = d3.scaleOrdinal(d3.schemeTableau10);

export const KgSourcePill: React.FunctionComponent<
  {idOnly?: boolean; source: KgSource} & ChipProps
> = ({idOnly, source, ...chipProps}) => {
  const color = colors(source.id);

  return (
    <Chip
      data-cy="source-link"
      label={idOnly ? source.id : `${source.id}: ${source.label}`}
      variant="outlined"
      style={{color, borderColor: color, margin: "2px"}}
      {...chipProps}
    />
  );
};
