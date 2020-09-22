import * as React from "react";
import {StringFilter} from "shared/models/kg/search/StringFilter";
import * as _ from "lodash";
import {invariant} from "ts-invariant";
import {Checkbox, FormControlLabel, List, ListItem} from "@material-ui/core";

export const StringFacetForm: React.FunctionComponent<{
  currentState?: StringFilter; // value id's only
  onChange: (newState?: StringFilter) => void;
  valueUniverse: {[index: string]: string}; // value id: value label
}> = ({currentState, onChange, valueUniverse}) => {
  if (_.isEmpty(valueUniverse)) {
    return null;
  }

  // Build sets of the excludeValueIdSet and includeValueIdSet values to avoid repeatedly iterating over the arrays.
  const excludeValueIdSet: Set<string> =
    currentState && currentState.exclude
      ? new Set(currentState.exclude)
      : new Set();
  const includeValueIdSet: Set<string> =
    currentState && currentState.include
      ? new Set(currentState.include)
      : new Set();

  // If a value is not in one of the sets it's implicitly included.
  Object.keys(valueUniverse).forEach((valueId) => {
    if (excludeValueIdSet.has(valueId)) {
      invariant(
        !includeValueIdSet.has(valueId),
        "value both included and excluded"
      );
    } else if (includeValueIdSet.has(valueId)) {
    } else if (currentState?.include && currentState.include.length > 0) {
      // If the current state explicitly included something then everything not explicitly included is excluded
      excludeValueIdSet.add(valueId);
    } else {
      // If the current state explicitly excluded something then everything not explicitly excluded is included
      includeValueIdSet.add(valueId);
    }
  });
  invariant(
    includeValueIdSet.size + excludeValueIdSet.size ===
      Object.keys(valueUniverse).length,
    "sets should account for all values"
  );
  // console.info("Exclude: " + [...excludeValueIdSet]);
  // console.info("Include: " + [...includeValueIdSet]);

  return (
    <List>
      {Object.keys(valueUniverse).map((valueId) => {
        const valueLabel = valueUniverse[valueId];

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
              Object.keys(valueUniverse).length,
            "sets should account for all values"
          );

          if (includeValueIdSet.size === Object.keys(valueUniverse).length) {
            onChange(undefined); // Implicitly includeValueIdSet all values
          } else if (
            excludeValueIdSet.size === Object.keys(valueUniverse).length
          ) {
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
              data-cy={"facet-value-" + valueId}
              label={valueLabel}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
