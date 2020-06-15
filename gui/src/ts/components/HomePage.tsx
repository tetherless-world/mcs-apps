import * as React from "react";

import {KgNodeSearchBox} from "components/kg/search/KgNodeSearchBox";
import {Frame} from "components/frame/Frame";

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

import {KgDataSummaryContext} from "KgDataSummaryProvider";
import {KgNodeSearchBoxValue} from "models/kg/KgNodeSearchBoxValue";
import {kgId} from "api/kgId";

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

export const HomePage: React.FunctionComponent = () => {
  const classes = useStyles();

  const history = useHistory();

  const data = React.useContext(KgDataSummaryContext);

  const [search, setSearch] = React.useState<KgNodeSearchBoxValue>(null);

  const onSearchChange = (newValue: KgNodeSearchBoxValue) =>
    setSearch(newValue);

  const onSearchSubmit = () => {
    if (search === null) {
      return;
    }

    switch (search.__typename) {
      case "KgNode":
        history.push(Hrefs.kg(kgId).node(search.id));
        break;
      case "KgNodeSearchVariables":
        history.push(Hrefs.kg(kgId).nodeSearch(search));
        break;
      default:
        const _exhaustiveCheck: never = search;
        _exhaustiveCheck;
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
                    {data.kgById.totalNodesCount} nodes
                  </strong>{" "}
                  with{" "}
                  <strong data-cy="totalEdgeCount">
                    {data.kgById.totalEdgesCount} relationships
                  </strong>
                </Typography>

                <KgNodeSearchBox
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
                <Button
                  color="primary"
                  component={Link}
                  to={Hrefs.kg(kgId).randomNode}
                >
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
