import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as KgPathPageQueryDocument from "api/queries/kg/KgPathPageQuery.graphql";
import {
  KgPathPageQuery,
  KgPathPageQueryVariables,
} from "api/queries/kg/types/KgPathPageQuery";
import {useQuery} from "@apollo/react-hooks";
import {ForceGraph} from "components/data/forceGraph/ForceGraph";
import * as d3 from "d3";
import {KgNode} from "models/kg/KgNode";
import * as ReactLoader from "react-loader";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {kgId} from "api/kgId";
import {Grid, Typography, Breadcrumbs, Button} from "@material-ui/core";
import {KgPathsTable} from "components/kg/path/KgPathsTable";
import {KgPathTable} from "./KgPathTable";

import {
  RouteComponentProps,
  Switch,
  Route,
  Link,
  useHistory,
  useLocation,
} from "react-router-dom";
import {ForceGraphNode} from "components/data/forceGraph/ForceGraphNode";
import {ForceGraphLink} from "components/data/forceGraph/ForceGraphLink";

interface KgPathNode extends d3.SimulationNodeDatum, KgNode {
  pathId: string;
}

interface KgPathEdge extends d3.SimulationLinkDatum<KgPathNode> {
  id: string;
}

export const KgPathPage: React.FunctionComponent<RouteComponentProps> = ({
  match,
}) => {
  // Path information for nested routes
  const history = useHistory();
  const location = useLocation();
  const {url, path} = match;

  // Refs to calculate path graph container dimensions
  const pathGraphContainerRef = React.useRef<HTMLDivElement>(null);

  const [pathGraphDimensions, setPathGraphDimensions] = React.useState<{
    height: number;
    width: number;
  }>({
    width: 400,
    height: 400,
  });

  const {data, error} = useQuery<KgPathPageQuery, KgPathPageQueryVariables>(
    KgPathPageQueryDocument,
    {variables: {kgId}}
  );

  // Format path data into d3 form
  const pathGraphData = React.useMemo<{
    nodes: KgPathNode[];
    links: KgPathEdge[];
  }>(() => {
    const nodes: KgPathNode[] = [];
    const links: KgPathEdge[] = [];

    data?.kgById.paths.forEach((path) => {
      path.edges.forEach((edge) => {
        if (
          edge.subjectNode &&
          !nodes.some((node) => node.id === edge.subject)
        ) {
          nodes.push({...edge.subjectNode, pathId: path.id});
        }

        if (edge.objectNode && !nodes.some((node) => node.id === edge.object)) {
          nodes.push({...edge.objectNode, pathId: path.id});
        }

        links.push({
          source: edge.subject,
          target: edge.object,
          id: edge.subject + "-" + edge.object,
        });
      });
    });

    return {nodes, links};
  }, [data]);

  // Update graph dimensions to fill flexbox container
  // Might be bugged? For some reason, pathGraphContainerRef is always
  // null on first render
  React.useLayoutEffect(() => {
    if (!pathGraphContainerRef.current) {
      return;
    }

    // Use the height of the table and width of graph container
    const {clientWidth} = pathGraphContainerRef.current;

    if (
      // Dimensions returned by ref can be off a little so
      // include margin of error
      Math.abs(pathGraphDimensions.width - clientWidth) < 10
    ) {
      return;
    }

    // Shave a little off the edge to avoid overflowing the flexbox container
    // and messing up the layout
    setPathGraphDimensions((prev) => ({...prev, width: clientWidth - 5}));
  }, [pathGraphContainerRef.current]);

  // Handle data error immediately after all hooks are run
  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  // Initialize color scale
  const pathColorScale = d3.scaleOrdinal(d3.schemeCategory10);
  data?.kgById.paths.forEach((path) => pathColorScale(path.id));

  // Nested routes containing with urls and paths
  const pathPageNestedRoutes = {
    allPaths: {url, path},
    path(id: string) {
      return {
        url: url + "/" + encodeURIComponent(id),
        path: path + "/" + encodeURIComponent(id),
      };
    },
  };

  // Extract selectedPath from end of path
  const selectedPathId = decodeURIComponent(
    location.pathname.slice(path.length + 1)
  );
  const selectedPath =
    data?.kgById.paths.find((path) => path.id === selectedPathId) || null;

  // Select new path and navigate to nested page route
  const setSelectedPath = (id: string) => {
    history.push(pathPageNestedRoutes.path(id).path);
  };

  return (
    <Frame>
      <ReactLoader loaded={data !== undefined}>
        <Grid container>
          <Grid item md={4} ref={pathGraphContainerRef}>
            <ForceGraph
              {...pathGraphDimensions}
            >
              {pathGraphData.nodes.map((node) => (
                <ForceGraphNode
                  key={node.id}
                  node={node}
                  fill={pathColorScale(node.pathId)}
                  onClick={() => {
                    if (node.pathId === selectedPath?.id) {
                      return;
                    }
                    setSelectedPath(node.pathId);
                  }}
                />
              ))}
              {pathGraphData.links.map((link) => (
                <ForceGraphLink
                  key={link.source + "-" + link.target}
                  link={link}
                />
              ))}
            </ForceGraph>
          </Grid>
          <Grid item md={8} container direction="column" spacing={2}>
            <Grid item>
              <Breadcrumbs>
                {selectedPath ? (
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={pathPageNestedRoutes.allPaths.url}
                    data-cy="all-paths"
                  >
                    <span data-cy="path-count">
                      {data?.kgById.paths.length || 0}
                    </span>{" "}
                    paths
                  </Button>
                ) : (
                  <Typography variant="h6">
                    <span data-cy="path-count">
                      {data?.kgById.paths.length || 0}
                    </span>{" "}
                    paths
                  </Typography>
                )}

                {selectedPath && (
                  <Typography variant="h6">
                    <div
                      style={{
                        height: "10px",
                        width: "10px",
                        backgroundColor: pathColorScale(selectedPath.id),
                        display: "inline-block",
                      }}
                    ></div>{" "}
                    <span data-cy="selected-path-id">{selectedPath.id}</span>
                  </Typography>
                )}
              </Breadcrumbs>
            </Grid>

            <Grid item>
              <Switch>
                <Route exact path={pathPageNestedRoutes.allPaths.path}>
                  <KgPathsTable
                    paths={data?.kgById.paths || []}
                    color={(path) => pathColorScale(path.id)}
                    onClick={(path) => setSelectedPath(path.id)}
                  />
                </Route>
                <Route>
                  {selectedPath && <KgPathTable path={selectedPath} />}
                  {!selectedPath && <Typography>Path not found</Typography>}
                </Route>
              </Switch>
            </Grid>
          </Grid>
        </Grid>
      </ReactLoader>
    </Frame>
  );
};
