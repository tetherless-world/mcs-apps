import * as React from "react";
import {Navbar} from "components/navbar/Navbar";

import {makeStyles, createStyles, Grid} from "@material-ui/core";
import {Footer} from "../footer/Footer";

import * as ReactLoader from "react-loader";
import {KgDataSummaryContext} from "KgDataSummaryProvider";

const useStyles = makeStyles((theme) =>
  createStyles({
    frameLoader: {
      display: "flex",
      minHeight: "100%",
    },
    frame: {
      flexGrow: 1,
    },
    rootContainer: {
      display: "flex",
      flexGrow: 1,
    },
    root: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  })
);

export const Frame: React.FunctionComponent<{children: React.ReactNode}> = ({
  children,
}) => {
  const classes = useStyles();

  const data = React.useContext(KgDataSummaryContext);

  return (
    <ReactLoader
      loaded={data !== undefined}
      loadedClassName={classes.frameLoader}
    >
      <Grid
        className={classes.frame}
        container
        data-cy="frame"
        direction="column"
        spacing={0} // Adds margins to sides of pages so set to 0
      >
        <Grid item>
          <Navbar />
        </Grid>
        <Grid className={classes.rootContainer} item>
          <div className={classes.root} data-cy="frame-content">
            {children}
          </div>
        </Grid>
        <Grid item>
          <hr />
          <Footer />
        </Grid>
      </Grid>
    </ReactLoader>
  );
};
