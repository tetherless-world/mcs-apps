import * as React from "react";

import {KgNodeSearchBox} from "kg/components/kg/search/KgNodeSearchBox";
import {KgFrame} from "kg/components/frame/KgFrame";

import {
  Button,
  Container,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";

import {Link, useHistory} from "react-router-dom";

import {KgHrefs} from "kg/KgHrefs";
import {KgNodeSearchBoxValue} from "shared/models/kg/node/KgNodeSearchBoxValue";
import {kgId} from "shared/api/kgId";
import {useQuery} from "@apollo/react-hooks";
import {KgHomePageQuery} from "kg/api/queries/types/KgHomePageQuery";
import * as KgHomePageQueryDocument from "kg/api/queries/KgHomePageQuery.graphql";
import {KgSourceSelect} from "kg/components/kg/search/KgSourceSelect";
import {KgNodeQuery, StringFacetFilter} from "kg/api/graphqlGlobalTypes";

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

export const KgHomePage: React.FunctionComponent = () => {
  const classes = useStyles();

  const history = useHistory();

  const query = useQuery<KgHomePageQuery>(KgHomePageQueryDocument, {
    variables: {kgId},
  });

  const [
    sourcesFilter,
    setSourcesFilter,
  ] = React.useState<StringFacetFilter | null>(null);
  const [searchBoxValue, setSearchBoxValue] = React.useState<
    KgNodeSearchBoxValue
  >(null);

  const onSearchSubmit = () => {
    if (searchBoxValue === null) {
      return;
    }

    switch (searchBoxValue.__typename) {
      case "KgNode":
        history.push(KgHrefs.kg({id: kgId}).node({id: searchBoxValue.id}));
        break;
      case "text":
        const query: KgNodeQuery = {};
        query.text = searchBoxValue.text;
        if (sourcesFilter) {
          query.filters = {sourceIds: sourcesFilter};
        }

        history.push(
          KgHrefs.kg({id: kgId}).nodeSearch({
            __typename: "KgNodeSearchVariables",
            query,
          })
        );
        break;
      default:
        const _exhaustiveCheck: never = searchBoxValue;
        _exhaustiveCheck;
    }
  };

  return (
    <KgFrame {...query}>
      {({data}) => (
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
                    <KgNodeSearchBox
                      autoFocus
                      placeholder="Search a word or try a query"
                      onChange={setSearchBoxValue}
                      onSubmit={onSearchSubmit}
                    />
                  </Grid>
                  <Grid item>
                    <KgSourceSelect
                      onChange={setSourcesFilter}
                      sources={data.kgById.sources}
                      style={{display: "inline-flex", verticalAlign: "top"}}
                      value={sourcesFilter || undefined}
                    ></KgSourceSelect>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row">
                      <Grid item>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={onSearchSubmit}
                        >
                          Search
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          color="primary"
                          component={Link}
                          to={KgHrefs.kg({id: kgId}).randomNode}
                        >
                          Show me something interesting
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Container>
      )}
    </KgFrame>
  );
};
