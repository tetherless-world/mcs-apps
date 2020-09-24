import {StringFilter} from "shared/models/kg/search/StringFilter";
import {KgSearchResultTypeFilter} from "shared/models/kg/search/KgSearchResultTypeFilter";

export interface KgSearchFilters {
  sourceIds?: StringFilter | null;
  types?: KgSearchResultTypeFilter | null;
}
