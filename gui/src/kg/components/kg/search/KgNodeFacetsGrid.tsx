import * as React from "react";
import {invariant} from "ts-invariant";
import * as _ from "lodash";
import {
  Checkbox,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControlLabel,
  Grid,
  List,
  ListItem,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {StringFacetFilter} from "shared/models/StringFacetFilter";
import {KgNodeFacetsFragment} from "kg/api/queries/types/KgNodeFacetsFragment";
import {KgNodeFilters} from "shared/models/kg/node/KgNodeFilters";
import {KgNodeQuery} from "kg/api/graphqlGlobalTypes";

const FacetExpansionPanel: React.FunctionComponent<{
  children: React.ReactNode;
  id: string;
  title: string;
}> = ({children, id, title}) => {
  return (
    <Grid item className="facet" data-cy={id + "-facet"}>
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          {title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{children}</ExpansionPanelDetails>
      </ExpansionPanel>
    </Grid>
  );
};

const StringFacet: React.FunctionComponent<{
  allValues: {[index: string]: string}; // value id: value label
  currentState?: StringFacetFilter; // value id's only
  id: string;
  onChange: (newState?: StringFacetFilter) => void;
  title: string;
}> = ({allValues, currentState, id, onChange, title}) => {
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
    <FacetExpansionPanel id={id} title={title}>
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
            } else if (
              excludeValueIdSet.size === Object.keys(allValues).length
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
                label={valueLabel}
              />
            </ListItem>
          );
        })}
      </List>
    </FacetExpansionPanel>
  );
};

export const KgNodeFacetsGrid: React.FunctionComponent<{
  facets: KgNodeFacetsFragment;
  onChange: (query: KgNodeQuery) => void;
  query: KgNodeQuery;
}> = ({facets, onChange, query}) => {
  const isStringFacetFilterEmpty = (
    filter: StringFacetFilter | null | undefined
  ): boolean => {
    if (!filter) {
      return true;
    }
    if (filter.include && filter.include.length > 0) {
      return false;
    }
    if (filter.exclude && filter.exclude.length > 0) {
      return false;
    }
    return true;
  };

  const isFiltersEmpty = (filters: KgNodeFilters): boolean => {
    if (!isStringFacetFilterEmpty(filters.sourceIds)) {
      return false;
    }
    return true;
  };

  const onChangeStringFacetFilter = (
    attribute: keyof KgNodeFilters,
    newState?: StringFacetFilter
  ) => {
    const newQuery: KgNodeQuery = _.cloneDeep(query);
    if (!newQuery.filters) {
      newQuery.filters = {};
    }
    newQuery.filters[attribute] = newState;
    if (isFiltersEmpty(newQuery.filters)) {
      newQuery.filters = undefined;
    }
    onChange(newQuery);
  };

  const onChangeSourceIds = (newState?: StringFacetFilter) =>
    onChangeStringFacetFilter("sourceIds", newState);

  return (
    <Grid container direction="column">
      <StringFacet
        allValues={facets.sources.reduce(
          (map: {[index: string]: string}, source) => {
            map[source.id] = source.label;
            return map;
          },
          {}
        )}
        currentState={
          query.filters && query.filters.sourceIds
            ? query.filters.sourceIds
            : undefined
        }
        id="source-ids"
        onChange={onChangeSourceIds}
        title={"Sources"}
      />
    </Grid>
  );
};
