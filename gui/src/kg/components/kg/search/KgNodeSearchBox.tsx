import * as React from "react";
import * as _ from "lodash";
import {Paper, InputAdornment, InputBase, IconButton} from "@material-ui/core";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {GraphQLError} from "graphql";
import {
  KgNodeSearchBoxQuery,
  KgNodeSearchBoxQueryVariables,
} from "kg/api/queries/types/KgNodeSearchBoxQuery";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgNodeSearchBoxQueryDocument from "kg/api/queries/KgNodeSearchBoxQuery.graphql";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {KgNode} from "shared/models/kg/node/KgNode";
import {KgSourceSelect} from "kg/components/kg/search/KgSourceSelect";
import {KgNodeSearchBoxValue} from "shared/models/kg/node/KgNodeSearchBoxValue";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import {kgId} from "shared/api/kgId";
import {KgNodeFilters} from "shared/models/kg/node/KgNodeFilters";
import {StringFilter} from "shared/models/StringFilter";
import {KgSource} from "shared/models/kg/source/KgSource";

// Throttle wait duration in milliseconds
// Minimum time between requests
const THROTTLE_WAIT_DURATION = 500;

interface KgNodeSearchTextValue {
  __typename: "string";
  value: string;
}

type KgNodeSearchAutocompleteValue = KgNodeSearchTextValue | KgNode;

export const KgNodeSearchBox: React.FunctionComponent<{
  autoFocus?: boolean;
  sources: KgSource[];
  placeholder?: string;
  showIcon?: boolean;
  onSubmit?: (value: KgNodeSearchAutocompleteValue) => void;
  autocompleteStyle?: React.CSSProperties;
  value?: string;
  onChange?: (value: KgNodeSearchBoxValue) => void;
  showSourcesSelect?: boolean;
}> = ({
  autoFocus,
  sources,
  onSubmit: onSubmitUserDefined,
  showIcon = false,
  placeholder,
  autocompleteStyle,
  value,
  onChange,
  showSourcesSelect,
}) => {
  const history = useHistory();

  const apolloClient = useApolloClient();

  // Search represents state of node label search and filters
  const [search, setSearch] = React.useState<{
    __typename: "KgNodeSearchVariables";
    text: string;
    filters: KgNodeFilters;
  }>({
    __typename: "KgNodeSearchVariables",
    text: value || "",
    filters: {},
  });

  // selectedSearchResult represents the autocomplete search
  // suggestion that the user is currently highlighting
  const [
    selectedSearchResult,
    setSelectedSearchResult,
  ] = React.useState<KgNode | null>(null);

  const [searchResults, setSearchResults] = React.useState<KgNode[]>([]);

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
        variables: KgNodeSearchBoxQueryVariables,
        callback: (
          data: KgNodeSearchBoxQuery,
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
          .query<KgNodeSearchBoxQuery, KgNodeSearchBoxQueryVariables>({
            query: KgNodeSearchBoxQueryDocument,
            variables,
          })
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
        kgId,
        query: {
          filters: search.filters,
          text: `${search.text}`,
        },
      },
      ({kgById}, errors) => {
        if (!active) {
          return;
        }

        if (errors !== searchErrors) {
          setSearchErrors(errors);
        }

        setSearchResults(kgById.matchingNodes);
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
    : (value: KgNodeSearchAutocompleteValue) => {
        if (value.__typename === "string") {
          const text = value.value;

          if (text.length === 0) {
            return;
          }

          history.push(
            Hrefs.kg({id: kgId}).nodeSearch({
              __typename: "KgNodeSearchVariables",
              query: {
                filters: search.filters,
                text,
              },
            })
          );
        } else if (value.__typename === "KgNode") {
          history.push(Hrefs.kg({id: kgId}).node({id: value.id}));
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
        getOptionLabel={(option: KgNode | string) =>
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
        onHighlightChange={(_, option: KgNode | null) => {
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
          <KgNodeLink node={node} sources={node.sources} />
        )}
      ></Autocomplete>
      {showSourcesSelect && (
        <KgSourceSelect
          sources={sources}
          style={{display: "inline-flex", verticalAlign: "top"}}
          value={search.filters.sources || undefined}
          onChange={(sourcesFilter: StringFilter) => {
            setSearch((prev) => ({
              ...prev,
              filters: {
                ...prev.filters,
                sources: sourcesFilter,
              },
            }));
          }}
        ></KgSourceSelect>
      )}
    </form>
  );
};
