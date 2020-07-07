import {KgNodeFilters} from "shared/models/kg/KgNodeFilters";

export interface KgNodeSearchVariables {
  __typename: "KgNodeSearchVariables";
  filters?: KgNodeFilters;
  offset?: number;
  limit?: number;
  text?: string;
}
