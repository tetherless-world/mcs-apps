import * as React from "react";

import {KgNodeSearchBox} from "shared/components/kg/search/KgNodeSearchBox";
import {Frame} from "kg/components/frame/Frame";

import {
  Grid,
  Container,
  Typography,
  makeStyles,
  createStyles,
  Button,
} from "@material-ui/core";

import {useHistory, Link} from "react-router-dom";

import {Hrefs} from "kg/Hrefs";
import {KgNodeSearchBoxValue} from "shared/models/kg/KgNodeSearchBoxValue";
import {kgId} from "shared/api/kgId";
import {useQuery} from "@apollo/react-hooks";
import {KgHomePageQuery} from "kg/api/queries/types/KgHomePageQuery";
import * as KgHomePageQueryDocument from "kg/api/queries/KgHomePageQuery.graphql";

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

  const [search, setSearch] = React.useState<KgNodeSearchBoxValue>(null);

  const onSearchChange = (newValue: KgNodeSearchBoxValue) =>
    setSearch(newValue);

  const onSearchSubmit = () => {
    if (search === null) {
      return;
    }

    switch (search.__typename) {
      case "KgNode":
        history.push(Hrefs.kg({id: kgId}).node({id: search.id}));
        break;
      case "KgNodeSearchVariables":
        history.push(Hrefs.kg({id: kgId}).nodeSearch(search));
        break;
      default:
        const _exhaustiveCheck: never = search;
        _exhaustiveCheck;
    }
  };

  return (
    <Frame {...query}>
      {({data}) => (
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
                  <KgNodeSearchBox
                    autoFocus
                    datasources={data.kgById.datasources}
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
                  <Button
                    color="primary"
                    component={Link}
                    to={Hrefs.kg({id: kgId}).randomNode}
                  >
                    Show me something interesting
                  </Button>
                </React.Fragment>
              )}
            </Grid>
          </Grid>
        </Container>
      )}
    </Frame>
  );
};
