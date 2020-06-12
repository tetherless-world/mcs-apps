import {KgNodeFilters} from "api/graphqlGlobalTypes";

export interface NodeSearchVariables {
  __typename: "NodeSearchVariables";
  text: string;
  filters: KgNodeFilters;
  offset?: number;
  limit?: number;
}
