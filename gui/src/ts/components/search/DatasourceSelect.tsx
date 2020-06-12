import * as React from "react";

import {Select, MenuItem, Paper} from "@material-ui/core";

import {StringFilter} from "api/graphqlGlobalTypes";
import {DataSummaryContext} from "DataSummaryProvider";

export const DatasourceSelect: React.FunctionComponent<{
  value?: StringFilter;
  onChange?: (datasourceFilters: StringFilter) => void;
  style?: React.CSSProperties;
}> = ({value, onChange, style}) => {
  const data = React.useContext(DataSummaryContext);
  const datasources = data?.kg.datasources;

  const [selectedDatasource, setSelectedDatasource] = React.useState<string>(
    value?.include?.[0] || ""
  );

  if (!datasources) {
    return null;
  }

  return (
    <Paper variant="outlined" square style={style} data-cy="datasourceSelect">
      <Select
        displayEmpty
        value={selectedDatasource}
        onChange={(event: React.ChangeEvent<{value: unknown}>) => {
          const value = event.target.value as string;

          setSelectedDatasource(value);

          if (onChange) {
            onChange(value.length > 0 ? {include: [value]} : {});
          }
        }}
        renderValue={(selected) => (
          <span style={{marginLeft: "5px"}} data-cy="value">
            {(selected as string).length === 0 ? (
              <React.Fragment>All datasources</React.Fragment>
            ) : (
              (selected as string)
            )}
          </span>
        )}
      >
        <MenuItem value="" data-cy="allDatasourcesSelectMenuItem">
          All datasources
        </MenuItem>
        {datasources.map((datasource) => (
          <MenuItem
            key={datasource}
            value={datasource}
            data-cy="datasourceSelectMenuItem"
          >
            {datasource}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  );
};
