import {KgNodeQuery, KgNodeSort} from "kg/api/graphqlGlobalTypes";

export interface KgSearchVariables {
  __typename: "KgNodeSearchVariables";
  limit?: number;
  offset?: number;
  query?: KgNodeQuery;
  sorts?: KgNodeSort[];
}
