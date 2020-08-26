import * as React from "react";
import * as _ from "lodash";
import {IconButton, InputAdornment, InputBase, Paper} from "@material-ui/core";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";
import {GraphQLError} from "graphql";
import {
  KgSearchBoxAutocompleteQuery,
  KgSearchBoxAutocompleteQuery_kgById_search,
  KgSearchBoxAutocompleteQueryVariables,
} from "kg/api/queries/types/KgSearchBoxAutocompleteQuery";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgSearchBoxAutocompleteQueryDocument from "kg/api/queries/KgSearchBoxAutocompleteQuery.graphql";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import {kgId} from "shared/api/kgId";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";
import {redirectToKgSearchBoxValue} from "kg/components/kg/search/redirecToKgSearchBoxValue";
import {KgSource} from "shared/models/kg/source/KgSource";

// Throttle wait duration in milliseconds
// Minimum time between requests
const THROTTLE_WAIT_DURATION = 500;

export const KgSearchBox: React.FunctionComponent<{
  autocompleteStyle?: React.CSSProperties;
  autoFocus?: boolean;
  filters?: KgSearchFilters;
  placeholder?: string;
  onChange?: (value: KgSearchBoxValue) => void;
  sources: readonly KgSource[];
  value?: string;
}> = ({
  autocompleteStyle,
  autoFocus,
  filters,
  onChange,
  placeholder,
  sources,
}) => {
  const history = useHistory();

  const apolloClient = useApolloClient();

  const [text, setText] = React.useState<string | undefined>(undefined);

  // selectedAutocompleteResult represents the autocomplete search
  // suggestion that the user is currently highlighting
  const [
    selectedAutocompleteResult,
    setSelectedAutocompleteResult,
  ] = React.useState<KgSearchBoxAutocompleteQuery_kgById_search | null>(null);

  const [autocompleteResults, setAutocompleteResults] = React.useState<
    KgSearchBoxAutocompleteQuery_kgById_search[]
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
    if (!text || text.length === 0) {
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

        setAutocompleteResults(kgById.search);
      }
    );

    return () => {
      active = false;
    };
  }, [text, throttledQuery]);

  const getOptionLabel = (
    option: KgSearchBoxAutocompleteQuery_kgById_search
  ) => {
    if (typeof option === "string") {
      return option;
    }
    switch (option.__typename) {
      case "KgEdgeLabelSearchResult":
        return option.edgeLabel;
      case "KgEdgeSearchResult":
        return option.edge.label ?? option.edge.id;
      case "KgNodeLabelSearchResult":
        return option.nodeLabel;
      case "KgNodeSearchResult":
        return option.node.label ?? option.node.id;
      case "KgSourceSearchResult": {
        const source = sources.find((source) => source.id === option.sourceId);
        return source ? source.label : option.sourceId;
      }
      default:
        throw new EvalError();
      // const _exhaustiveCheck: never = value;
      // _exhaustiveCheck;
    }
  };

  const handleSubmit = () => {
    if (selectedAutocompleteResult) {
      onSubmit(selectedAutocompleteResult);
    } else if (text) {
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
        onHighlightChange={(
          _,
          option: KgSearchBoxAutocompleteQuery_kgById_search | null
        ) => {
          setSelectedAutocompleteResult(option);
        }}
        options={autocompleteResults}
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
        renderOption={(option) => {
          switch (option.__typename) {
            case "KgNodeSearchResult": {
              const node = option.node;
              return <KgNodeLink node={node} sources={node.sources} />;
            }
            default:
              return getOptionLabel(option);
            // default:
            //   const _exhaustiveCheck: never = value;
            //   _exhaustiveCheck;
          }
        }}
        style={{verticalAlign: "top", ...autocompleteStyle}}
      ></Autocomplete>
    </form>
  );
};
