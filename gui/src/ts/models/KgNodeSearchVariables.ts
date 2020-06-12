import {KgNodeFilters} from "api/graphqlGlobalTypes";

export interface KgNodeSearchVariables {
  __typename: "KgNodeSearchVariables";
  text: string;
  filters: KgNodeFilters;
  offset?: number;
  limit?: number;
}
