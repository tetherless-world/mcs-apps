import * as React from "react";

import {
  Typography,
  AppBar,
  Toolbar,
  makeStyles,
  createStyles,
  Button,
} from "@material-ui/core";

import {Hrefs} from "benchmark/Hrefs";
import {Link, useLocation} from "react-router-dom";

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

type TopLevelPath = {
  readonly path: string;
  readonly label: string;
};

export const Navbar: React.FunctionComponent<{}> = () => {
  const classes = useStyles();

  const location = useLocation();

  const topLevelPaths: TopLevelPath[] = [
    {path: Hrefs.kgs, label: "CSKG"},
    {path: Hrefs.benchmarks, label: "Benchmarks"},
  ];

  function normalizePath(path: string) {
    return path.toLowerCase().replace(/\/$/, "");
  }

  let closestPathMatch: string = "";
  for (const tlp of topLevelPaths) {
    const currentPathNormed = normalizePath(location.pathname);
    const tlpNormed = normalizePath(tlp.path);
    const pathMatches: boolean =
      currentPathNormed === tlpNormed ||
      currentPathNormed.startsWith(tlpNormed + "/");
    if (pathMatches && tlp.path.length > closestPathMatch.length) {
      closestPathMatch = tlp.path;
    }
  }

  return (
    <AppBar className={classes.navbar} position="static" data-cy="naVbar">
      <Toolbar>
        <Button component={Link} to={Hrefs.home} className={classes.brand}>
          <Typography variant="h5">MCS Portal</Typography>
        </Button>
        {topLevelPaths.map((tlp) => (
          <Button
            key={tlp.path}
            component={Link}
            to={tlp.path}
            className={
              classes.navButton +
              (tlp.path === closestPathMatch
                ? " " + classes.activeNavButton
                : "")
            }
          >
            {tlp.label}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};
