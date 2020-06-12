import * as React from "react";

import {
  Typography,
  AppBar,
  Toolbar,
  makeStyles,
  createStyles,
  Button,
} from "@material-ui/core";

import {KgNodeSearchBox} from "components/kg/search/KgNodeSearchBox";

import {Hrefs} from "Hrefs";
import {Link} from "react-router-dom";

const useStyles = makeStyles((theme) =>
  createStyles({
    navbar: {
      zIndex: 0, // Override z-index so search autcomplete will be on top navbar
    },
    brand: {
      marginRight: theme.spacing(2),
      color: "white",
    },
  })
);

export const Navbar: React.FunctionComponent<{}> = () => {
  const classes = useStyles();

  return (
    <AppBar className={classes.navbar} position="static" data-cy="navbar">
      <Toolbar>
        <Button component={Link} to={Hrefs.home} className={classes.brand}>
          <Typography variant="h6">MCS Portal</Typography>
        </Button>
        <KgNodeSearchBox
          showIcon={true}
          autocompleteStyle={{display: "inline-flex"}}
        />
      </Toolbar>
    </AppBar>
  );
};
