import {KgSearchQuery, KgSearchSort} from "kg/api/graphqlGlobalTypes";

export interface KgSearchVariables {
  __typename: "KgSearchVariables";
  limit?: number;
  offset?: number;
  query?: KgSearchQuery;
  sorts?: KgSearchSort[];
}
