import * as React from "react";

import {
  AppBar,
  Button,
  createStyles,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";

import {KgHrefs} from "kg/KgHrefs";
import {Link} from "react-router-dom";
import {KgNodeSearchBox} from "../kg/search/KgNodeSearchBox";
import {KgNavbarProps} from "kg/components/navbar/KgNavbarProps";

const useStyles = makeStyles((theme) =>
  createStyles({
    navbar: {
      zIndex: 0, // Override z-index so search autcomplete will be on top navbar
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

export const KgNavbar: React.FunctionComponent<KgNavbarProps> = ({
  hideNavbarSearchBox,
}) => {
  const classes = useStyles();

  return (
    <AppBar className={classes.navbar} position="static" data-cy="naVbar">
      <Toolbar>
        <Button component={Link} to={KgHrefs.home} className={classes.brand}>
          <Typography variant="h5">CSKG</Typography>
        </Button>
        {!hideNavbarSearchBox ? (
          <KgNodeSearchBox
            autocompleteStyle={{display: "inline-block"}}
            placeholder="Search a word"
          />
        ) : null}
      </Toolbar>
    </AppBar>
  );
};
