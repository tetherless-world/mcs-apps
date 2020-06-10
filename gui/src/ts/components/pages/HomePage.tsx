import * as React from "react";

import {NodeSearchBox} from "components/search/NodeSearchBox";
import {Frame} from "components/frame/Frame";
import {Node} from "models/Node";

import {
  Grid,
  Container,
  Typography,
  makeStyles,
  createStyles,
  Button,
} from "@material-ui/core";

import {useHistory, Link} from "react-router-dom";

import {Hrefs} from "Hrefs";
import {NodeSearchVariables} from "models/NodeSearchVariables";
import {DataSummaryContext} from "DataSummaryProvider";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      paddingTop: theme.spacing(5),
    },
    title: {
      fontFamily: "Hiragino Maru Gothic Pro",
    },
    primaryText: {
      color: theme.palette.primary.main,
    },
  })
);

type NodeSearchAutocompleteValue = NodeSearchVariables | Node;

export const HomePage: React.FunctionComponent = () => {
  const classes = useStyles();

  const history = useHistory();

  const data = React.useContext(DataSummaryContext);

  const [
    search,
    setSearch,
  ] = React.useState<NodeSearchAutocompleteValue | null>(null);

  const onSearchChange = (newValue: NodeSearchAutocompleteValue | null) =>
    setSearch(newValue);

  const onSearchSubmit = () => {
    if (search === null) {
      return;
    }

    switch (search.__typename) {
      case "Node":
        return history.push(Hrefs.node(search.id));
      case "NodeSearchVariables":
        return history.push(Hrefs.nodeSearch(search));
    }
  };

  return (
    <Frame>
      <Container maxWidth="md" className={classes.container}>
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Typography variant="h2" className={classes.title}>
              MCS Portal
            </Typography>
          </Grid>
          <Grid item>
            {data && (
              <React.Fragment>
                <Typography>
                  Search{" "}
                  <strong data-cy="totalNodeCount">
                    {data.totalNodesCount} nodes
                  </strong>{" "}
                  with{" "}
                  <strong data-cy="totalEdgeCount">
                    {data.totalEdgesCount} relationships
                  </strong>
                </Typography>

                <NodeSearchBox
                  autoFocus
                  placeholder="Search a word or try a query"
                  showIcon={true}
                  onChange={onSearchChange}
                />
                <br />
                <Button
                  color="primary"
                  variant="contained"
                  onClick={onSearchSubmit}
                >
                  Search
                </Button>
                <Button color="primary" component={Link} to={Hrefs.randomNode}>
                  Show me something interesting
                </Button>
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </Container>
    </Frame>
  );
};
