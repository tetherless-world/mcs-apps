import {NodeFilters} from "api/graphqlGlobalTypes";

export interface NodeSearchVariables {
  text: string;
  filters: NodeFilters;
  offset?: number;
  limit?: number;
}
