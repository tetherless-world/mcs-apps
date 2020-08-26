import * as React from "react";
import * as _ from "lodash";
import {Grid} from "@material-ui/core";
import {StringFacetFilter} from "shared/models/StringFacetFilter";
import {KgSearchFacetsFragment} from "kg/api/queries/types/KgSearchFacetsFragment";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";
import {KgSearchQuery} from "kg/api/graphqlGlobalTypes";
import {StringFacetForm} from "kg/components/kg/search/StringFacetForm";
import {FacetExpansionPanel} from "kg/components/kg/search/FacetExpansionPanel";
import {KgSource} from "shared/models/kg/source/KgSource";

export const KgSearchFacetsGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  facets: KgSearchFacetsFragment;
  onChange: (query: KgSearchQuery) => void;
  query: KgSearchQuery;
}> = ({allSources, facets, onChange, query}) => {
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

  const isFiltersEmpty = (filters: KgSearchFilters): boolean => {
    if (!isStringFacetFilterEmpty(filters.sourceIds)) {
      return false;
    }
    return true;
  };

  const onChangeStringFacetFilter = (
    attribute: keyof KgSearchFilters,
    newState?: StringFacetFilter
  ) => {
    const newQuery: KgSearchQuery = _.cloneDeep(query);
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
          currentState={
            query.filters && query.filters.sourceIds
              ? query.filters.sourceIds
              : undefined
          }
          onChange={onChangeSourceIds}
          valueUniverse={facets.sourceIds.reduce(
            (map: {[index: string]: string}, sourceId) => {
              const source = allSources.find(
                (source) => source.id === sourceId.value
              );
              if (source) {
                map[sourceId.value] = source.label;
              } else {
                map[sourceId.value] = sourceId.value;
              }
              return map;
            },
            {}
          )}
        />
      </FacetExpansionPanel>
    </Grid>
  );
};
