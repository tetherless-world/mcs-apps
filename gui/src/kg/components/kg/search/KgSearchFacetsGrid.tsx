import * as React from "react";
import * as _ from "lodash";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from "@material-ui/core";
import {StringFilter} from "shared/models/kg/search/StringFilter";
import {KgSearchFacetsFragment} from "kg/api/queries/types/KgSearchFacetsFragment";
import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";
import {
  KgSearchQuery,
  KgSearchResultType,
  KgSearchResultTypeFilter,
} from "kg/api/graphqlGlobalTypes";
import {StringFacetForm} from "kg/components/kg/search/StringFacetForm";
import {KgSource} from "shared/models/kg/source/KgSource";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const FacetAccordion: React.FunctionComponent<{
  children: React.ReactNode;
  id: string;
  title: string;
}> = ({children, id, title}) => {
  return (
    <Grid item className="facet" data-cy={id + "-facet"}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {title}
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export const KgSearchFacetsGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  facets: KgSearchFacetsFragment;
  onChange: (query: KgSearchQuery) => void;
  query: KgSearchQuery;
}> = ({allSources, facets, onChange, query}) => {
  const isStringFilterEmpty = (
    filter: KgSearchResultTypeFilter | StringFilter | null | undefined
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
    if (!isStringFilterEmpty(filters.types)) {
      return false;
    }
    return true;
  };

  const onChangeFilter = (changeFilter: (filters: KgSearchFilters) => void) => {
    const newQuery: KgSearchQuery = _.cloneDeep(query);
    if (!newQuery.filters) {
      newQuery.filters = {};
    }
    changeFilter(newQuery.filters!);
    if (isFiltersEmpty(newQuery.filters)) {
      newQuery.filters = undefined;
    }
    onChange(newQuery);
  };

  return (
    <Grid container direction="column" spacing={4}>
      <Grid item>
        <FacetAccordion id="types" title="Types">
          <StringFacetForm
            currentState={
              query.filters && query.filters.types
                ? query.filters.types
                : undefined
            }
            onChange={(newState) =>
              onChangeFilter((filters) => {
                if (isStringFilterEmpty(newState)) {
                  filters.types = undefined;
                  return;
                }
                filters.types = {
                  exclude: newState?.exclude?.map(
                    (value) => value as KgSearchResultType
                  ),
                  include: newState?.include?.map(
                    (value) => value as KgSearchResultType
                  ),
                };
              })
            }
            valueUniverse={facets.types.map((type) => ({
              count: type.count,
              id: type.value,
              label: type.value,
            }))}
          />
        </FacetAccordion>
      </Grid>
      <Grid item>
        <FacetAccordion id="sources" title="Sources">
          <StringFacetForm
            currentState={
              query.filters && query.filters.sourceIds
                ? query.filters.sourceIds
                : undefined
            }
            onChange={(newState) =>
              onChangeFilter((filters) => (filters.sourceIds = newState))
            }
            valueUniverse={facets.sourceIds.map((sourceId) => ({
              count: sourceId.count,
              id: sourceId.value,
              label: resolveSourceId({allSources, sourceId: sourceId.value})
                .label,
            }))}
          />
        </FacetAccordion>
      </Grid>
    </Grid>
  );
};
