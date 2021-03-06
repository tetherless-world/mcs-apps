import * as React from "react";
import {KgNavbar} from "kg/components/navbar/KgNavbar";

import {makeStyles, createStyles, Grid} from "@material-ui/core";
import {Footer} from "shared/components/footer/Footer";

import * as ReactLoader from "react-loader";
import {ApolloErrorHandler} from "shared/components/error/ApolloErrorHandler";
import {ApolloError} from "apollo-client";
import {KgSource} from "shared/models/kg/source/KgSource";

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

interface KgFrameData {
  kgById: {
    sources: readonly KgSource[];
  };
}

interface KgFrameProps<TData extends KgFrameData> {
  children: (props: {data: TData}) => React.ReactNode;
  data?: TData;
  error?: ApolloError;
  hideNavbarSearchBox?: boolean;
  loading: boolean;
}

export const KgFrame = <TData extends KgFrameData>({
  children,
  data,
  error,
  hideNavbarSearchBox,
  loading,
}: KgFrameProps<TData>) => {
  const classes = useStyles();

  if (error) {
    return <ApolloErrorHandler error={error} />;
  } else if (loading) {
    // Drop down
  } else if (!data) {
    throw new EvalError();
  }

  return (
    <ReactLoader loaded={!loading} loadedClassName={classes.frameLoader}>
      <Grid
        className={classes.frame}
        container
        data-cy="frame"
        direction="column"
        spacing={0} // Adds margins to sides of pages so set to 0
      >
        <Grid item>
          <KgNavbar
            allSources={data ? data.kgById.sources : []}
            hideNavbarSearchBox={hideNavbarSearchBox}
          />
        </Grid>
        <Grid className={classes.rootContainer} item>
          <div className={classes.root} data-cy="frame-content">
            {data ? children({data}) : null}
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
