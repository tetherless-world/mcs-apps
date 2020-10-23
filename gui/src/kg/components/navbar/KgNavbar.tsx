import * as React from "react";

import {
  AppBar,
  Button,
  createStyles,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {KgSearchBox} from "../kg/search/KgSearchBox";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSearchForm} from "kg/components/kg/search/KgSearchForm";
import {Hrefs} from "shared/Hrefs";
import {HrefsContext} from "shared/HrefsContext";
import {kgId} from "shared/api/kgId";

const useStyles = makeStyles((theme) =>
  createStyles({
    navbar: {
      zIndex: 0, // Override z-index so search autocomplete will be on top navbar
    },
    brand: {
      marginRight: theme.spacing(2),
      color: theme.palette.primary.contrastText,
    },
    navButton: {
      color: theme.palette.primary.contrastText,
    },
    activeNavButton: {
      background: theme.palette.secondary.light,
    },
  })
);

export const KgNavbar: React.FunctionComponent<{
  allSources: readonly KgSource[];
  hideNavbarSearchBox?: boolean;
}> = ({allSources, hideNavbarSearchBox}) => {
  const classes = useStyles();
  const hrefs = React.useContext<Hrefs>(HrefsContext);

  return (
    <AppBar className={classes.navbar} position="static" data-cy="naVbar">
      <Toolbar>
        <Button
          component={Link}
          to={hrefs.kg({id: kgId}).home}
          className={classes.brand}
        >
          <Typography variant="h5">CSKG</Typography>
        </Button>
        {!hideNavbarSearchBox ? (
          <KgSearchForm>
            {({onChangeSearchBoxValue, onSubmit}) => (
              <KgSearchBox
                allSources={allSources}
                autocompleteStyle={{display: "inline-block"}}
                onChange={onChangeSearchBoxValue}
                onSubmit={onSubmit}
                placeholder="Search a word"
              />
            )}
          </KgSearchForm>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};
