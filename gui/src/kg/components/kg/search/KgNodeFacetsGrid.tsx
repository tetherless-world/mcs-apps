import * as React from "react";
import * as _ from "lodash";
import {Grid} from "@material-ui/core";
import {StringFacetFilter} from "shared/models/StringFacetFilter";
import {KgNodeFacetsFragment} from "kg/api/queries/types/KgNodeFacetsFragment";
import {KgNodeFilters} from "shared/models/kg/node/KgNodeFilters";
import {KgNodeQuery} from "kg/api/graphqlGlobalTypes";
import {StringFacetForm} from "kg/components/kg/search/StringFacetForm";
import {FacetExpansionPanel} from "kg/components/kg/search/FacetExpansionPanel";

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
      <FacetExpansionPanel id="sources" title="Sources">
        <StringFacetForm
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
          onChange={onChangeSourceIds}
        />
      </FacetExpansionPanel>
    </Grid>
  );
};
