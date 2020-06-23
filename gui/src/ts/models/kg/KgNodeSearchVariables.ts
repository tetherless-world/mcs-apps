import {KgNodeFilters} from "api/graphqlGlobalTypes";

export interface KgNodeSearchVariables {
  __typename: "KgNodeSearchVariables";
  filters?: KgNodeFilters;
  offset?: number;
  limit?: number;
  text?: string;
}
