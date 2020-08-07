import {KgNodeQuery} from "kg/api/graphqlGlobalTypes";

export interface KgNodeSearchVariables {
  __typename: "KgNodeSearchVariables";
  limit?: number;
  offset?: number;
  query?: KgNodeQuery;
}
