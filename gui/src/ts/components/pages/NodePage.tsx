import * as React from "react";
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  useLocation,
} from "react-router-dom";
import * as NodePageQueryDocument from "api/queries/NodePageQuery.graphql";
import {
  NodePageQuery,
  NodePageQuery_nodeById_subjectOfEdges,
  NodePageQueryVariables,
} from "api/queries/types/NodePageQuery";
import {useQuery} from "@apollo/react-hooks";
import {ApolloException} from "@tetherless-world/twxplore-base";
import {FatalErrorModal} from "components/error/FatalErrorModal";
import * as ReactLoader from "react-loader";
import {Frame} from "components/frame/Frame";
import {Grid, List, ListItemText, Tab, Tabs} from "@material-ui/core";
import {NodeConceptNetView} from "components/node/NodeConceptNetView";
import {NodeWikidataView} from "components/node/NodeWikidataView";
// import {makeStyles} from "@material-ui/core/styles";

// const useStyles = makeStyles((theme) => ({
//   nodePropertyValue: {
//     fontWeight: "bold",
//   },
// }));

interface NodePageRouteParams {
  nodeId: string;
}

export const NodePage: React.FunctionComponent<RouteComponentProps<
  NodePageRouteParams
>> = ({match}) => {
  const location = useLocation();
  const {path, url} = match;
  const nodeId = match.params.nodeId;

  const [tabState, setTabState] = React.useState<string>(location.pathname);

  // const classes = useStyles();

  const {data, error, loading} = useQuery<
    NodePageQuery,
    NodePageQueryVariables
  >(NodePageQueryDocument, {variables: {id: nodeId}});

  if (error) {
    return <FatalErrorModal exception={new ApolloException(error)} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  const node = data.nodeById;
  if (!node) {
    return (
      <Frame>
        <h3>
          <code>{nodeId} not found</code>
        </h3>
      </Frame>
    );
  }

  const nodeLabel = node.label ? node.label : node.id;

  let title = nodeLabel;
  if (node.pos) {
    title += " (" + node.pos + ")";
  }

  const predicateSubjects: {
    [index: string]: NodePageQuery_nodeById_subjectOfEdges[];
  } = {};
  for (const edge of node.subjectOfEdges) {
    if (!edge.objectNode) {
      continue;
    } else if (!edge.predicate) {
      continue;
    }
    const edges = predicateSubjects[edge.predicate];
    if (edges) {
      edges.push(edge);
    } else {
      predicateSubjects[edge.predicate] = [edge];
    }
  }

  return (
    <Frame>
      <Grid container direction="column">
        <Tabs
          value={tabState}
          onChange={(event, newValue) => setTabState(newValue)}
          aria-label="nav tabs example"
        >
          <Tab component={Link} value={url} to={url} label="ConceptNet Style" />
          <Tab
            component={Link}
            value={`${url}/wikidata`}
            to={`${url}/wikidata`}
            label="Wikidata Style"
          />
        </Tabs>

        <Grid item container>
          <Grid item xs={10}>
            <h2 data-cy="node-title">{title}</h2>
            <Switch>
              <Route exact path={path}>
                <NodeConceptNetView
                  predicateSubjects={predicateSubjects}
                />
              </Route>
              <Route path={`${path}/wikidata`}>
                <NodeWikidataView />
              </Route>
            </Switch>
          </Grid>
          <Grid item xs={2}>
            <h3>
              Data source:{" "}
              <span data-cy="node-datasource">{node.datasource}</span>
            </h3>
            {node.aliases ? (
              <React.Fragment>
                <h3>Aliases</h3>
                <List>
                  {[...new Set(node.aliases)].map((alias) => (
                    <ListItemText key={alias}>{alias}</ListItemText>
                  ))}
                </List>
              </React.Fragment>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </Frame>
  );
};
