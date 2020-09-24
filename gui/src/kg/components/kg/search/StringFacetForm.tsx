import * as React from "react";
import {StringFilter} from "shared/models/kg/search/StringFilter";
import {invariant} from "ts-invariant";
import {Checkbox, FormControlLabel, List, ListItem} from "@material-ui/core";

export const StringFacetForm: React.FunctionComponent<{
  currentState?: StringFilter; // value id's only
  onChange: (newState?: StringFilter) => void;
  valueUniverse: readonly {
    count: number;
    id: string;
    label: string;
  }[];
}> = ({currentState, onChange, valueUniverse}) => {
  if (valueUniverse.length === 0) {
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
  for (const value of valueUniverse) {
    if (excludeValueIdSet.has(value.id)) {
      invariant(
        !includeValueIdSet.has(value.id),
        "value both included and excluded"
      );
    } else if (includeValueIdSet.has(value.id)) {
    } else if (currentState?.include && currentState.include.length > 0) {
      // If the current state explicitly included something then everything not explicitly included is excluded
      excludeValueIdSet.add(value.id);
    } else {
      // If the current state explicitly excluded something then everything not explicitly excluded is included
      includeValueIdSet.add(value.id);
    }
  }
  invariant(
    includeValueIdSet.size + excludeValueIdSet.size === valueUniverse.length,
    "sets should account for all values"
  );
  // console.info("Exclude: " + [...excludeValueIdSet]);
  // console.info("Include: " + [...includeValueIdSet]);

  return (
    <List>
      {valueUniverse.map((value) => {
        const onChangeValue = (
          e: React.ChangeEvent<HTMLInputElement>
        ): void => {
          const newChecked = e.target.checked;
          excludeValueIdSet.delete(value.id);
          includeValueIdSet.delete(value.id);
          if (newChecked) {
            includeValueIdSet.add(value.id);
          } else {
            excludeValueIdSet.add(value.id);
          }

          invariant(
            includeValueIdSet.size + excludeValueIdSet.size ===
              valueUniverse.length,
            "sets should account for all values"
          );

          if (includeValueIdSet.size === valueUniverse.length) {
            onChange(undefined); // Implicitly includeValueIdSet all values
          } else if (excludeValueIdSet.size === valueUniverse.length) {
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
          <ListItem className="w-100" key={value.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeValueIdSet.has(value.id)}
                  onChange={onChangeValue}
                />
              }
              data-cy={"facet-value-" + value.id}
              label={value.label}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
