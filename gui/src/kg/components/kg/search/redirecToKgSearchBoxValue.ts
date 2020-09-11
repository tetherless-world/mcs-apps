import {KgSearchBoxValue} from "shared/models/kg/search/KgSearchBoxValue";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";

export const redirectToKgSearchBoxValue = (
  history: any,
  value: KgSearchBoxValue
) => {
  if (value === null) {
    history.push(Hrefs.kg({id: kgId}).search());
    return;
  }

  const kgHrefs = Hrefs.kg({id: kgId});

  switch (value.__typename) {
    case "KgEdgeLabelSearchResult":
    case "KgEdgeSearchResult":
    case "KgSourceSearchResult":
      throw new EvalError();
    case "KgNodeLabelSearchResult": {
      history.push(kgHrefs.nodeLabel({label: value.nodeLabel}));
      break;
    }
    case "KgNodeSearchResult": {
      history.push(kgHrefs.node({id: value.node.id}));
      break;
    }
    case "text": {
      const valueText = value.text;

      if (valueText.length === 0) {
        history.push(Hrefs.kg({id: kgId}).search());
        return;
      }

      history.push(
        Hrefs.kg({id: kgId}).search({
          __typename: "KgSearchVariables",
          query: {
            filters: value.filters,
            text: valueText,
          },
        })
      );

      break;
    }
    default: {
      const _exhaustiveCheck: never = value;
      _exhaustiveCheck;
    }
  }
};
