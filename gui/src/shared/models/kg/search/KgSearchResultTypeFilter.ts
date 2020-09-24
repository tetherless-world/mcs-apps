import {KgSearchResultType} from "kg/api/graphqlGlobalTypes";

export interface KgSearchResultTypeFilter {
  exclude?: KgSearchResultType[] | null;
  include?: KgSearchResultType[] | null;
}
