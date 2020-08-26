import * as React from "react";
import * as _ from "lodash";
import {IconButton, InputAdornment, InputBase, Paper} from "@material-ui/core";

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
import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import {kgId} from "shared/api/kgId";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";

// Throttle wait duration in milliseconds
// Minimum time between requests
const THROTTLE_WAIT_DURATION = 500;

export const KgSearchBox: React.FunctionComponent<{
  autocompleteStyle?: React.CSSProperties;
  autoFocus?: boolean;
  filters?: KgSearchFilters;
  placeholder?: string;
  onChange?: (value: KgSearchBoxValue) => void;
  onSubmit?: (value: KgSearchBoxValue) => void;
  value?: string;
}> = ({
  autocompleteStyle,
  autoFocus,
  filters,
  onChange,
  onSubmit: onSubmitUserDefined,
  placeholder,
}) => {
  const history = useHistory();

  const apolloClient = useApolloClient();

  const [text, setText] = React.useState<string | undefined>(undefined);

  // selectedAutocompleteResult represents the autocomplete search
  // suggestion that the user is currently highlighting
  const [
    selectedAutocompleteResult,
    setSelectedAutocompleteResult,
  ] = React.useState<KgNode | null>(null);

  const [searchResults, setSearchResults] = React.useState<KgNode[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [searchErrors, setSearchErrors] = React.useState<
    readonly GraphQLError[] | undefined
  >(undefined);

  // If onChange is provided, call with updates
  // to `search` and `selectedAutocompleteResult`
  React.useEffect(() => {
    if (!onChange) {
      return;
    }

    // User highlight new autocomplete suggestion
    if (selectedAutocompleteResult) {
      onChange(selectedAutocompleteResult);
      return;
    }

    // Empty text search update
    if (!text || text.length === 0) {
      onChange(null);
      return;
    }

    // Free text search update
    onChange({__typename: "text", text: text});
  }, [selectedAutocompleteResult, text]);

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
    if (!text || text.length === 0) {
      return;
    }

    throttledQuery.current(
      {
        kgId,
        query: {
          filters,
          text,
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
  }, [text, throttledQuery]);

  // The user can submit either
  // 1) a free text label search
  //    -> redirect to NodeSearchResultsPage
  // 2) a Node from the autcomplete search suggestions
  //    -> redirect to NodePage
  const onSubmit = onSubmitUserDefined
    ? onSubmitUserDefined
    : (value: KgSearchBoxValue) => {
        if (value === null) {
          history.push(Hrefs.kg({id: kgId}).nodeSearch());
        } else if (value.__typename === "text") {
          const valueText = value.text;

          if (valueText.length === 0) {
            history.push(Hrefs.kg({id: kgId}).nodeSearch());
            return;
          }

          history.push(
            Hrefs.kg({id: kgId}).nodeSearch({
              __typename: "KgNodeSearchVariables",
              query: {
                filters,
                text: valueText,
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
      selectedAutocompleteResult || {__typename: "text", text: text ?? ""}
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
        inputValue={text}
        onInputChange={(_, newInputValue: string) => setText(newInputValue)}
        onHighlightChange={(_, option: KgNode | null) => {
          setSelectedAutocompleteResult(option);
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
                <InputAdornment position="end" style={{marginRight: "8px"}}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleSubmit()}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </IconButton>
                </InputAdornment>
              }
              error={searchErrors !== undefined}
            ></InputBase>
          </Paper>
        )}
        renderOption={(node) => (
          <KgNodeLink node={node} sources={node.sources} />
        )}
      ></Autocomplete>
    </form>
  );
};
