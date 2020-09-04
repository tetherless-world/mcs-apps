import * as React from "react";
import * as _ from "lodash";
import {IconButton, InputAdornment, InputBase, Paper} from "@material-ui/core";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";
import {GraphQLError} from "graphql";
import {
  KgSearchBoxAutocompleteQuery,
  KgSearchBoxAutocompleteQueryVariables,
} from "kg/api/queries/types/KgSearchBoxAutocompleteQuery";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgSearchBoxAutocompleteQueryDocument from "kg/api/queries/KgSearchBoxAutocompleteQuery.graphql";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {kgId} from "shared/api/kgId";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";
import {redirectToKgSearchBoxValue} from "kg/components/kg/search/redirecToKgSearchBoxValue";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";
import {KgSearchResultLink} from "shared/components/kg/search/KgSearchResultLink";

// Throttle wait duration in milliseconds
// Minimum time between requests
const THROTTLE_WAIT_DURATION = 500;

export const KgSearchBox: React.FunctionComponent<{
  allSources: readonly KgSource[];
  autocompleteStyle?: React.CSSProperties;
  autoFocus?: boolean;
  filters?: KgSearchFilters;
  placeholder?: string;
  onChange?: (value: KgSearchBoxValue) => void;
  value?: string;
}> = ({
  allSources,
  autocompleteStyle,
  autoFocus,
  filters,
  onChange,
  placeholder,
}) => {
  const history = useHistory();

  const apolloClient = useApolloClient();

  // text being null or undefined causes the Autocomplete control to change its mode.
  const [text, setText] = React.useState<string>("");

  // selectedAutocompleteResult represents the autocomplete search
  // suggestion that the user is currently highlighting
  const [
    selectedAutocompleteResult,
    setSelectedAutocompleteResult,
  ] = React.useState<KgSearchResult | null>(null);

  const [autocompleteResults, setAutocompleteResults] = React.useState<
    KgSearchResult[]
  >([]);

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
    if (text.length === 0) {
      onChange(null);
      return;
    }

    // Free text search update
    onChange({__typename: "text", filters, text: text});
  }, [selectedAutocompleteResult, text]);

  // Query server for search results to display
  // Is throttled so server request is only sent
  // once every THROTTLE_WAIT_DURATION
  // If a call is made within that duration, the
  // callback is called with the previous result
  const throttledQuery = React.useRef(
    _.throttle(
      (
        variables: KgSearchBoxAutocompleteQueryVariables,
        callback: (
          data: KgSearchBoxAutocompleteQuery,
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
            KgSearchBoxAutocompleteQuery,
            KgSearchBoxAutocompleteQueryVariables
          >({
            query: KgSearchBoxAutocompleteQueryDocument,
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
    if (text.length === 0) {
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

        setAutocompleteResults(kgById.search);
      }
    );

    return () => {
      active = false;
    };
  }, [text, throttledQuery]);

  const getOptionLabel = (option: KgSearchResult | string) => {
    if (typeof option === "string") {
      return option;
    }
    return getKgSearchResultLabel({result: option, allSources});
  };

  const handleSubmit = () => {
    if (selectedAutocompleteResult) {
      onSubmit(selectedAutocompleteResult);
    } else if (text.length > 0) {
      onSubmit({__typename: "text", text});
    } else {
      onSubmit(null);
    }
  };

  const onSubmit = (value: KgSearchBoxValue) =>
    redirectToKgSearchBoxValue(history, value);

  return (
    <form
      data-cy="nodeSearchBox"
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        handleSubmit();
      }}
    >
      <Autocomplete
        disablePortal
        freeSolo
        getOptionLabel={getOptionLabel}
        includeInputInList
        inputValue={text}
        loading={isLoading}
        noOptionsText="No results"
        onInputChange={(_, newInputValue: string) => setText(newInputValue)}
        onHighlightChange={(_, option: KgSearchResult | null) => {
          setSelectedAutocompleteResult(option);
        }}
        options={autocompleteResults}
        renderInput={(params) => (
          <Paper variant="outlined" square>
            <InputBase
              autoFocus={autoFocus}
              inputProps={{
                "data-cy": "searchTextInput",
                style: {paddingLeft: "5px", width: "32em"},
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
        renderOption={(option) => (
          <KgSearchResultLink result={option} allSources={allSources} />
        )}
        style={{verticalAlign: "top", ...autocompleteStyle}}
      ></Autocomplete>
    </form>
  );
};
