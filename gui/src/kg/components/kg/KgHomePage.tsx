import * as React from "react";

import {KgSearchBox} from "kg/components/kg/search/KgSearchBox";
import {KgFrame} from "kg/components/frame/KgFrame";

import {
  Button,
  Container,
  createStyles,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";

import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {useQuery} from "@apollo/react-hooks";
import {KgHomePageQuery} from "kg/api/queries/types/KgHomePageQuery";
import * as KgHomePageQueryDocument from "kg/api/queries/KgHomePageQuery.graphql";
import {KgSourceSelect} from "kg/components/kg/search/KgSourceSelect";
import {KgSearchQuery, StringFilter} from "kg/api/graphqlGlobalTypes";
import {KgSearchLink} from "shared/components/kg/search/KgSearchLink";
import {KgSearchForm} from "kg/components/kg/search/KgSearchForm";
import {Hrefs} from "shared/Hrefs";
import {HrefsContext} from "shared/HrefsContext";

// Constants
const CONCEPT_NET_SOURCE_ID = "CN";
const WORD_NET_SOURCE_ID = "WN";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      paddingTop: theme.spacing(5),
    },
    sourceSelectContainer: {
      display: "inline-flex",
      verticalAlign: "top",
    },
    sourceSelectSelect: {
      paddingLeft: "1em",
      width: "24em",
    },
    title: {
      fontFamily: "Hiragino Maru Gothic Pro",
    },
    primaryText: {
      color: theme.palette.primary.main,
    },
  })
);

const KgSearchListItem: React.FunctionComponent<React.PropsWithChildren<{
  query: KgSearchQuery;
}>> = ({children, query}) => (
  <ListItem>
    <ListItemText>
      <KgSearchLink query={query}>{children}</KgSearchLink>
    </ListItemText>
  </ListItem>
);

export const KgHomePage: React.FunctionComponent = () => {
  const classes = useStyles();
  const hrefs = React.useContext<Hrefs>(HrefsContext);

  const query = useQuery<KgHomePageQuery>(KgHomePageQueryDocument, {
    variables: {kgId},
  });

  const [sourcesFilter, setSourcesFilter] = React.useState<StringFilter | null>(
    null
  );

  return (
    <KgFrame hideNavbarSearchBox={true} {...query}>
      {({data}) => {
        const sources = data.kgById.sources;
        return (
          <KgSearchForm>
            {({onChangeSearchBoxValue, onSubmit}) => (
              <Container maxWidth="lg" className={classes.container}>
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    <Typography variant="h2" className={classes.title}>
                      Common Sense Knowledge Graph
                    </Typography>
                  </Grid>
                  <Grid item>
                    {data && (
                      <Grid container direction="column" spacing={2}>
                        <Grid item>
                          <KgSearchBox
                            allSources={data.kgById.sources}
                            autoFocus
                            filters={
                              sourcesFilter
                                ? {sourceIds: sourcesFilter}
                                : undefined
                            }
                            onChange={onChangeSearchBoxValue}
                            onSubmit={onSubmit}
                            placeholder="Search a word or try a query"
                          />
                        </Grid>
                        <Grid item>
                          <KgSourceSelect
                            containerClassName={classes.sourceSelectContainer}
                            onChange={setSourcesFilter}
                            selectClassName={classes.sourceSelectSelect}
                            sources={sources}
                            value={sourcesFilter || undefined}
                          ></KgSourceSelect>
                        </Grid>
                        <Grid item>
                          <Grid container direction="row">
                            <Grid item>
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                              >
                                Search
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                color="primary"
                                component={Link}
                                to={hrefs.kg({id: kgId}).randomNode}
                              >
                                Show me something interesting
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item>
                    <h2>Examples:</h2>
                    <List>
                      <KgSearchListItem query={{}}>All nodes</KgSearchListItem>
                      {sources.some(
                        (source) => source.id === CONCEPT_NET_SOURCE_ID
                      ) ? (
                        <KgSearchListItem
                          query={{
                            filters: {
                              sourceIds: {include: [CONCEPT_NET_SOURCE_ID]},
                            },
                          }}
                        >
                          All nodes in ConceptNet
                        </KgSearchListItem>
                      ) : null}
                      {sources.some(
                        (source) => source.id === WORD_NET_SOURCE_ID
                      ) ? (
                        <KgSearchListItem
                          query={{
                            filters: {
                              sourceIds: {include: [WORD_NET_SOURCE_ID]},
                            },
                          }}
                        >
                          All nodes in WordNet
                        </KgSearchListItem>
                      ) : null}
                      <KgSearchListItem query={{text: "animal"}}>
                        Nodes relating to "animal"
                      </KgSearchListItem>
                    </List>
                  </Grid>
                </Grid>
              </Container>
            )}
          </KgSearchForm>
        );
      }}
    </KgFrame>
  );
};
