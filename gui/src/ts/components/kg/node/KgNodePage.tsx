import * as React from "react";
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  useLocation,
} from "react-router-dom";
import * as NodePageQueryDocument from "api/queries/kg/KgNodePageQuery.graphql";
import {
  KgNodePageQuery,
  KgNodePageQuery_kgById_nodeById_subjectOfEdges,
  KgNodePageQueryVariables,
} from "api/queries/kg/types/KgNodePageQuery";
import {useQuery} from "@apollo/react-hooks";
import {Frame} from "components/frame/Frame";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItemText,
  Tab,
  Tabs,
} from "@material-ui/core";
import {KgNodePredicateGrid} from "components/kg/node/KgNodePredicateGrid";
import {KgNodePredicateList} from "components/kg/node/KgNodePredicateList";
import {kgId} from "api/kgId";
import {NotFound} from "components/error/NotFound";
// import {makeStyles} from "@material-ui/core/styles";

// const useStyles = makeStyles((theme) => ({
//   nodePropertyValue: {
//     fontWeight: "bold",
//   },
// }));

interface KgNodePageRouteParams {
  nodeId: string;
}

export const KgNodePage: React.FunctionComponent<RouteComponentProps<
  KgNodePageRouteParams
>> = ({match}) => {
  const location = useLocation();
  const {path, url} = match;
  const nodeId = decodeURIComponent(match.params.nodeId);

  // const classes = useStyles();

  const query = useQuery<KgNodePageQuery, KgNodePageQueryVariables>(
    NodePageQueryDocument,
    {variables: {kgId, nodeId}}
  );

  return (
    <Frame {...query}>
      {({data}) => {
        const node = data.kgById.nodeById;
        if (!node) {
          return <NotFound label={nodeId} />;
        }

        const nodeLabel = node.label ? node.label : node.id;

        let title = nodeLabel;
        if (node.pos) {
          title += " (" + node.pos + ")";
        }

        const predicateSubjects: {
          [index: string]: KgNodePageQuery_kgById_nodeById_subjectOfEdges[];
        } = {};
        for (const edge of node.subjectOfEdges) {
          if (!edge.objectNode) {
            continue;
          } else if (!edge.predicate) {
            continue;
          }
          const edges = (predicateSubjects[edge.predicate] =
            predicateSubjects[edge.predicate] ?? []);
          edges.push(edge);
        }

        class TabRoute {
          constructor(
            private relPath: string,
            readonly label: string,
            readonly dataCy: string
          ) {}
          get url() {
            return url + this.relPath;
          }
          get path() {
            return path + this.relPath;
          }
        }

        const tabRoutes = {
          grid: new TabRoute("", "Predicate Grid", "predicate-grid"),
          list: new TabRoute("/list", "Predicate List", "predicate-list"),
        };

        return (
          <Grid container direction="column">
            <Tabs value={location.pathname}>
              {Object.values(tabRoutes).map((tabRoute) => (
                <Tab
                  component={Link}
                  value={tabRoute.url}
                  to={tabRoute.url}
                  key={tabRoute.url}
                  label={tabRoute.label}
                  data-cy={`${tabRoute.dataCy}`}
                />
              ))}
            </Tabs>

            <Grid item container>
              <Grid item xs={10}>
                <h2 data-cy="node-title">{title}</h2>
                <Switch>
                  <Route exact path={tabRoutes.grid.path}>
                    <KgNodePredicateGrid
                      predicateSubjects={predicateSubjects}
                      datasource={node.datasource}
                    />
                  </Route>
                  <Route path={tabRoutes.list.path}>
                    <KgNodePredicateList
                      predicateSubjects={predicateSubjects}
                      datasource={node.datasource}
                    />
                  </Route>
                </Switch>
              </Grid>
              <Grid item xs={2}>
                <Card>
                  <CardHeader title="Datasource(s)"></CardHeader>
                  <CardContent>
                    <List>
                      <ListItemText data-cy="node-datasource">
                        {node.datasource}
                      </ListItemText>
                    </List>
                  </CardContent>
                </Card>
                {node.aliases ? (
                  <Card>
                    <CardHeader title="Aliases" />
                    <CardContent>
                      <List>
                        {[...new Set(node.aliases)].map((alias) => (
                          <ListItemText key={alias}>{alias}</ListItemText>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        );
      }}
    </Frame>
  );
};
