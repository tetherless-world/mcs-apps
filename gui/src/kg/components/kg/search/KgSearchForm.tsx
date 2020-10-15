import * as React from "react";
import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {useHistory} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";

export const KgSearchForm: React.FunctionComponent<React.PropsWithChildren<{
  children: (props: {
    onChangeSearchBoxValue: (value: KgSearchBoxValue | null) => void;
    onSubmit: () => void;
  }) => React.ReactNode;
}>> = ({children}) => {
  const history = useHistory();

  // text being null or undefined causes the Autocomplete control to change its mode.
  const [
    searchBoxValue,
    setSearchBoxValue,
  ] = React.useState<KgSearchBoxValue | null>(null);

  const onSubmit = () => {
    if (searchBoxValue === null) {
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
        const searchBoxValueText = searchBoxValue.text;

        if (searchBoxValueText.length === 0) {
          history.push(Hrefs.kg({id: kgId}).search());
          return;
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

        break;
      }
      default: {
        const _exhaustiveCheck: never = searchBoxValue;
        _exhaustiveCheck;
      }
    }
  };

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
