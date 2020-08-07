import * as React from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export const FacetExpansionPanel: React.FunctionComponent<{
  children: React.ReactNode;
  id: string;
  title: string;
}> = ({children, id, title}) => {
  return (
    <Grid item className="facet" data-cy={id + "-facet"}>
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          {title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{children}</ExpansionPanelDetails>
      </ExpansionPanel>
    </Grid>
  );
};
