import {KgNodeFilters} from "shared/models/kg/KgNodeFilters";

export interface KgNodeSearchVariables {
  __typename: "KgNodeSearchVariables";
  filters?: KgNodeFilters;
  limit?: number;
  offset?: number;
  text?: string;
}
