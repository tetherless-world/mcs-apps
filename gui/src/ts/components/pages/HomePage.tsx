import * as React from "react";

import {NodeSearchBox} from "components/search/NodeSearchBox";
import {HomePageQuery} from "api/queries/types/HomePageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as HomePageQueryDocument from "api/queries/HomePageQuery.graphql";
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

const isNode = (obj: NodeSearchVariables | Node): obj is Node =>
  (obj as Node).id !== undefined;

export const HomePage: React.FunctionComponent = () => {
  const classes = useStyles();

  const history = useHistory();

  const {data} = useQuery<HomePageQuery>(HomePageQueryDocument);

  const [search, setSearch] = React.useState<NodeSearchVariables | Node | null>(
    null
  );

  const onSearchChange = (newValue: NodeSearchVariables | Node | null) =>
    setSearch(newValue);

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
            )}
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
              onClick={() => {
                if (search === null) {
                  return;
                } else if (isNode(search)) {
                  history.push(Hrefs.node(search.id));
                } else {
                  history.push(Hrefs.nodeSearch(search));
                }
              }}
            >
              Search
            </Button>
            <Button color="primary" component={Link} to={Hrefs.randomNode}>
              Show me something interesting
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Frame>
  );
};
