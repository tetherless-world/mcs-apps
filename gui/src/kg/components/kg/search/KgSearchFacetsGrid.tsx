import * as React from "react";
import * as _ from "lodash";
import {Grid} from "@material-ui/core";
import {StringFilter} from "shared/models/kg/search/StringFilter";
import {KgSearchFacetsFragment} from "kg/api/queries/types/KgSearchFacetsFragment";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";
import {KgSearchQuery} from "kg/api/graphqlGlobalTypes";
import {StringFacetForm} from "kg/components/kg/search/StringFacetForm";
import {FacetExpansionPanel} from "kg/components/kg/search/FacetExpansionPanel";
import {KgSource} from "shared/models/kg/source/KgSource";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";

export const KgSearchFacetsGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  facets: KgSearchFacetsFragment;
  onChange: (query: KgSearchQuery) => void;
  query: KgSearchQuery;
}> = ({allSources, facets, onChange, query}) => {
  const isStringFilterEmpty = (
    filter: StringFilter | null | undefined
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
    if (!isStringFilterEmpty(filters.sourceIds)) {
      return false;
    }
    return true;
  };

  const onChangeStringFilter = (
    attribute: keyof KgSearchFilters,
    newState?: StringFilter
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

  const onChangeSourceIds = (newState?: StringFilter) =>
    onChangeStringFilter("sourceIds", newState);

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
              map[sourceId.value] = resolveSourceId({
                allSources,
                sourceId: sourceId.value,
              }).label;
              return map;
            },
            {}
          )}
        />
      </FacetExpansionPanel>
    </Grid>
  );
};
