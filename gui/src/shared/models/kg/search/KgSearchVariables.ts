import {KgSearchQuery, KgNodeSort} from "kg/api/graphqlGlobalTypes";

export interface KgSearchVariables {
  __typename: "KgSearchVariables";
  limit?: number;
  offset?: number;
  query?: KgSearchQuery;
  sorts?: KgNodeSort[];
}
