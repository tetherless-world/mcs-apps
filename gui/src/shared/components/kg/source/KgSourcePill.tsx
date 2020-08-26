import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import {Chip} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import * as d3 from "d3";

const colors = d3.scaleOrdinal(d3.schemeTableau10);

export const KgSourcePill: React.FunctionComponent<{source: KgSource}> = ({
  source,
}) => {
  const history = useHistory();

  const color = colors(source.id);

  return (
    <Chip
      data-cy="source-link"
      label={source.label}
      variant="outlined"
      onClick={() => {
        history.push(
          Hrefs.kg({id: kgId}).search({
            query: {
              filters: {
                sourceIds: {include: [source.id]},
              },
            },
            __typename: "KgSearchVariables",
          })
        );
      }}
      style={{color, borderColor: color, margin: "2px"}}
    />
  );
};
