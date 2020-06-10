import * as React from "react";
import * as _ from "lodash";
import {Paper, InputAdornment, InputBase, IconButton} from "@material-ui/core";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useHistory, Link} from "react-router-dom";
import {Hrefs} from "Hrefs";
import {GraphQLError} from "graphql";
import {
  NodeSearchResultsPageQuery,
  NodeSearchResultsPageQueryVariables,
} from "api/queries/types/NodeSearchResultsPageQuery";
import {useApolloClient} from "@apollo/react-hooks";
import * as NodeSearchResultsPageQueryDocument from "api/queries/NodeSearchResultsPageQuery.graphql";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {Node} from "models/Node";
import {DatasourceSelect} from "components/search/DatasourceSelect";
import {NodeSearchVariables} from "models/NodeSearchVariables";
import {StringFilter} from "api/graphqlGlobalTypes";
import {NodeSearchBoxValue} from "models/NodeSearchBoxValue";

// Throttle wait duration in milliseconds
// Minimum time between requests
const THROTTLE_WAIT_DURATION = 500;

// Maximum number of suggestions to show
const MAXIMUM_SUGGESTIONS = 5;

interface NodeSearchTextValue {
  __typename: "string";
  value: string;
}

type NodeSearchAutocompleteValue = NodeSearchTextValue | Node;

export const NodeSearchBox: React.FunctionComponent<{
  autoFocus?: boolean;
  placeholder?: string;
  showIcon?: boolean;
  onSubmit?: (value: NodeSearchAutocompleteValue) => void;
  autocompleteStyle?: React.CSSProperties;
  value?: string;
  onChange?: (value: NodeSearchBoxValue) => void;
}> = ({
  autoFocus,
  onSubmit: onSubmitUserDefined,
  showIcon = false,
  placeholder,
  autocompleteStyle,
  value,
  onChange,
}) => {
  const history = useHistory();

  const apolloClient = useApolloClient();

  // Search represents state of node label search and filters
  const [search, setSearch] = React.useState<NodeSearchVariables>({
    __typename: "NodeSearchVariables",
    text: value || "",
    filters: {},
  });

  // selectedSearchResult represents the autocomplete search
  // suggestion that the user is currently highlighting
  const [
    selectedSearchResult,
    setSelectedSearchResult,
  ] = React.useState<Node | null>(null);

  const [searchResults, setSearchResults] = React.useState<Node[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [searchErrors, setSearchErrors] = React.useState<
    readonly GraphQLError[] | undefined
  >(undefined);

  // If onChange is provided, call with updates
  // to `search` and `selectedSearchResult`
  React.useEffect(() => {
    if (!onChange) {
      return;
    }

    // User highlight new autocomplete suggestion
    if (selectedSearchResult) {
      onChange(selectedSearchResult);
      return;
    }

    // Empty text search update
    if (search.text.length === 0) {
      onChange(null);
      return;
    }

    // Free text search update
    onChange(search);
  }, [selectedSearchResult, search]);

  // Query server for search results to display
  // Is throttled so server request is only sent
  // once every THROTTLE_WAIT_DURATION
  // If a call is made within that duration, the
  // callback is called with the previous result
  const throttledQuery = React.useRef(
    _.throttle(
      (
        variables: NodeSearchResultsPageQueryVariables,
        callback: (
          data: NodeSearchResultsPageQuery,
          errors: readonly GraphQLError[] | undefined
        ) => void
      ) => {
        // If there were searchErrors from previous query,
        // clear errors before new query
        if (searchErrors !== undefined) {
          setSearchErrors(undefined);
        }

        setIsLoading(true);

        apolloClient
          .query<
            NodeSearchResultsPageQuery,
            NodeSearchResultsPageQueryVariables
          >({query: NodeSearchResultsPageQueryDocument, variables})
          .then(({data, errors}) => {
            setIsLoading(false);
            callback(data, errors);
          });
      },
      THROTTLE_WAIT_DURATION
    )
  );

  // When the user types, call the throttled query with
  // new search text
  React.useEffect(() => {
    let active = true;

    // If text input is empty, skip query
    if (search.text.length === 0) {
      return;
    }

    throttledQuery.current(
      {
        text: `label:${search.text}`,
        filters: search.filters,
        limit: MAXIMUM_SUGGESTIONS,
        offset: 0,
        withCount: false,
      },
      ({matchingNodes}, errors) => {
        if (!active) {
          return;
        }

        if (errors !== searchErrors) {
          setSearchErrors(errors);
        }

        setSearchResults(matchingNodes);
      }
    );

    return () => {
      active = false;
    };
  }, [search, throttledQuery]);

  // The user can submit either
  // 1) a free text label search
  //    -> redirect to NodeSearchResultsPage
  // 2) a Node from the autcomplete search suggestions
  //    -> redirect to NodePage
  const onSubmit = onSubmitUserDefined
    ? onSubmitUserDefined
    : (value: NodeSearchAutocompleteValue) => {
        if (value.__typename === "string") {
          const text = value.value;

          if (text.length === 0) {
            return;
          }

          history.push(
            Hrefs.nodeSearch({
              __typename: "NodeSearchVariables",
              text,
              filters: search.filters,
            })
          );
        } else if (value.__typename === "Node") {
          history.push(Hrefs.node(value.id));
        } else {
          const _exhaustiveCheck: never = value;
          _exhaustiveCheck;
        }
      };

  // If user a search suggestion is highlighted submit Node
  // else submit search text
  const handleSubmit = () => {
    onSubmit(
      selectedSearchResult || {__typename: "string", value: search.text}
    );
  };

  return (
    <form
      data-cy="nodeSearchBox"
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        handleSubmit();
      }}
    >
      <Autocomplete
        style={{verticalAlign: "top", ...autocompleteStyle}}
        getOptionLabel={(option: Node | string) =>
          typeof option === "string" ? option : option.label!
        }
        options={searchResults}
        freeSolo
        disablePortal
        includeInputInList
        loading={isLoading}
        noOptionsText="No results"
        inputValue={search.text}
        onInputChange={(_, newInputValue: string) => {
          setSearch((prevSearch) => ({
            ...prevSearch,
            text: newInputValue,
          }));
        }}
        onHighlightChange={(_, option: Node | null) => {
          setSelectedSearchResult(option);
        }}
        renderInput={(params) => (
          <Paper variant="outlined" square>
            <InputBase
              autoFocus={autoFocus}
              inputProps={{
                "data-cy": "searchTextInput",
                style: {paddingLeft: "5px"},
                ...params.inputProps,
              }}
              ref={params.InputProps.ref}
              placeholder={placeholder}
              fullWidth
              startAdornment={
                showIcon ? (
                  <InputAdornment position="end" style={{marginRight: "8px"}}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleSubmit()}
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              error={searchErrors !== undefined}
            ></InputBase>
          </Paper>
        )}
        renderOption={(node) => (
          <Link to={Hrefs.node(node.id)}>
            {node.label} - {node.datasource}
          </Link>
        )}
      ></Autocomplete>
      <DatasourceSelect
        style={{display: "inline-flex", verticalAlign: "top"}}
        value={search.filters.datasource || undefined}
        onChange={(datasource: StringFilter) => {
          setSearch((prev) => ({
            ...prev,
            filters: {
              ...prev.filters,
              datasource,
            },
          }));
        }}
      ></DatasourceSelect>
    </form>
  );
};
