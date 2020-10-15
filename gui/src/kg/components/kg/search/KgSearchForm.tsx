import * as React from "react";
import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {useHistory} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgSearchFormNodeLabelQueryDocument from "kg/api/queries/KgSearchFormNodeLabelQuery.graphql";
import {ApolloError} from "apollo-boost";
import * as ReactDOM from "react-dom";
import {
  KgSearchFormNodeLabelQuery,
  KgSearchFormNodeLabelQueryVariables
} from "kg/api/queries/types/KgSearchFormNodeLabelQuery";

export const KgSearchForm: React.FunctionComponent<React.PropsWithChildren<{
  children: (props: {
    onChangeSearchBoxValue: (value: KgSearchBoxValue | null) => void;
    onSubmit: () => void;
  }) => React.ReactNode;
}>> = ({children}) => {
  const apolloClient = useApolloClient();

  const history = useHistory();

  // text being null or undefined causes the Autocomplete control to change its mode.
  const [
    searchBoxValue,
    setSearchBoxValue,
  ] = React.useState<KgSearchBoxValue | null>(null);

  const onSubmit = React.useCallback(() => {
    if (searchBoxValue === null) {
      // No text entered but form submitted, consider this a match-all search.
      history.push(Hrefs.kg({id: kgId}).search());
      return;
    }

    const kgHrefs = Hrefs.kg({id: kgId});

    switch (searchBoxValue.__typename) {
      case "KgEdgeLabelSearchResult":
      case "KgEdgeSearchResult":
      case "KgSourceSearchResult":
        throw new EvalError();
      case "KgNodeLabelSearchResult": {
        history.push(kgHrefs.nodeLabel({label: searchBoxValue.nodeLabel}));
        break;
      }
      case "KgNodeSearchResult": {
        history.push(kgHrefs.node({id: searchBoxValue.node.id}));
        break;
      }
      case "text": {
        // The user entered text in the search box but did not select an autocomplete result.

        const searchBoxValueText = searchBoxValue.text;

        if (searchBoxValueText.length === 0) {
          // Text was empty, consider this a match-all search.
          history.push(Hrefs.kg({id: kgId}).search());
          return;
        }

        // #257 if the user enters text to search for that exactly matches a node label, go to that node label page
        // instead of the search results page.
        // The user can also get to the node label page by selecting an autocomplete, but this allows typing and hitting enter.

        apolloClient
            .query<
                KgSearchFormNodeLabelQuery,
                KgSearchFormNodeLabelQueryVariables
                >({
              fetchPolicy: "no-cache",
              query: KgSearchFormNodeLabelQueryDocument,
              variables: {
                kgId,
                nodeLabel: searchBoxValueText
              },
            })
            .then(({data, errors, loading}) => {
              if (loading) {
                return;
              }

              if (data) {
                if (data.kgById.nodeLabel) {
                  // Exact node label match, go to node label page
                  history.push(
                      Hrefs.kg({id: kgId}).nodeLabel({label: data.kgById.nodeLabel.nodeLabel})
                  );
                  return;
                }
                // else drop down to go to search results page
              } else if (errors) {
                // Drop down to go to search results page
              } else {
                throw new EvalError();
              }

              history.push(
                  Hrefs.kg({id: kgId}).search({
                    __typename: "KgSearchVariables",
                    query: {
                      filters: searchBoxValue.filters,
                      text: searchBoxValueText,
                    },
                  })
              );
            });



        break;
      }
      default: {
        const _exhaustiveCheck: never = searchBoxValue;
        _exhaustiveCheck;
      }
    }
  }, [searchBoxValue];

  return (
    <form
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children({
        onChangeSearchBoxValue: setSearchBoxValue,
        onSubmit,
      })}
    </form>
  );
};
