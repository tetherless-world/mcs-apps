import * as React from "react";
import {StringFacetFilter} from "shared/models/StringFacetFilter";
import * as _ from "lodash";
import {invariant} from "ts-invariant";
import {Checkbox, FormControlLabel, List, ListItem} from "@material-ui/core";

export const StringFacetForm: React.FunctionComponent<{
  allValues: {[index: string]: string}; // value id: value label
  currentState?: StringFacetFilter; // value id's only
  onChange: (newState?: StringFacetFilter) => void;
}> = ({allValues, currentState, onChange}) => {
  if (_.isEmpty(allValues)) {
    return null;
  }

  // Build sets of the excludeValueIdSet and includeValueIdSet values to avoid repeatedly iterating over the arrays.
  const excludeValueIdSet: Set<string> =
    currentState && currentState.exclude
      ? new Set(...currentState.exclude)
      : new Set();
  const includeValueIdSet: Set<string> =
    currentState && currentState.include
      ? new Set(...currentState.include)
      : new Set();

  // If a value is not in one of the sets it's implicitly included.
  Object.keys(allValues).forEach((valueId) => {
    if (valueId in excludeValueIdSet) {
      invariant(
        !(valueId in includeValueIdSet),
        "value both included and excluded"
      );
    } else if (valueId in includeValueIdSet) {
    } else {
      includeValueIdSet.add(valueId);
    }
  });
  invariant(
    includeValueIdSet.size + excludeValueIdSet.size ===
      Object.keys(allValues).length,
    "sets should account for all values"
  );

  return (
    <List>
      {Object.keys(allValues).map((valueId) => {
        const valueLabel = allValues[valueId];

        const onChangeValue = (
          e: React.ChangeEvent<HTMLInputElement>
        ): void => {
          const newChecked = e.target.checked;
          excludeValueIdSet.delete(valueId);
          includeValueIdSet.delete(valueId);
          if (newChecked) {
            includeValueIdSet.add(valueId);
          } else {
            excludeValueIdSet.add(valueId);
          }

          invariant(
            includeValueIdSet.size + excludeValueIdSet.size ===
              Object.keys(allValues).length,
            "sets should account for all values"
          );

          if (includeValueIdSet.size === Object.keys(allValues).length) {
            onChange(undefined); // Implicitly includeValueIdSet all values
          } else if (excludeValueIdSet.size === Object.keys(allValues).length) {
            onChange({exclude: [...excludeValueIdSet]}); // Explicitly excludeValueIdSet all values
          } else if (includeValueIdSet.size >= excludeValueIdSet.size) {
            invariant(
              excludeValueIdSet.size > 0,
              "must explicitly excludeValueIdSet"
            );
            // excludeValueIdSet includes fewer values. Those outside it will be included.
            onChange({exclude: [...excludeValueIdSet]});
          } else {
            // includeValueIdSet includes fewer values. Those outside it will be excluded.
            invariant(
              includeValueIdSet.size > 0,
              "must explicitly includeValueIdSet"
            );
            onChange({include: [...includeValueIdSet]});
          }
        };

        return (
          <ListItem className="w-100" key={valueId}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeValueIdSet.has(valueId)}
                  onChange={onChangeValue}
                />
              }
              label={valueLabel}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
