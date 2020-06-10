import {NodeFilters} from "api/graphqlGlobalTypes";

export interface NodeSearchVariables {
  __typename: "NodeSearchVariables";
  text: string;
  filters: NodeFilters;
  offset?: number;
  limit?: number;
}
