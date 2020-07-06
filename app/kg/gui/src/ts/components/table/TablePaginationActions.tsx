// Using example Table Pagination Actions toolbar given by docs
// https://material-ui.com/components/tables/
import {
  createStyles,
  IconButton,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import * as React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

const TablePaginationActionsUseStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  })
);

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

export const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const classes = TablePaginationActionsUseStyles();
  const theme = useTheme();
  const {count, page, rowsPerPage, onChangePage} = props;

  return (
    <div className={classes.root}>
      <IconButton
        onClick={(event) => onChangePage(event, 0)}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? (
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        ) : (
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        )}
      </IconButton>
      <IconButton
        onClick={(event) => onChangePage(event, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <FontAwesomeIcon icon={faAngleRight} />
        ) : (
          <FontAwesomeIcon icon={faAngleLeft} />
        )}
      </IconButton>
      <IconButton
        onClick={(event) => onChangePage(event, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <FontAwesomeIcon icon={faAngleLeft} />
        ) : (
          <FontAwesomeIcon icon={faAngleRight} />
        )}
      </IconButton>
      <IconButton
        onClick={(event) =>
          onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
        }
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? (
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        ) : (
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        )}
      </IconButton>
    </div>
  );
};
