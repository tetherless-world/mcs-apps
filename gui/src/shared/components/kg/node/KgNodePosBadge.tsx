import {withStyles, createStyles, Theme, Badge} from "@material-ui/core";

export const KgNodePosBadge = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: "15px",
    },
    badge: {
      right: 5,
      top: 0,
    },
  })
)(Badge);
