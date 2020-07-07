import * as React from "react";

import {Select, MenuItem, Paper} from "@material-ui/core";
import {StringFilter} from "shared/models/StringFilter";

export const KgDatasourceSelect: React.FunctionComponent<{
  datasources: string[];
  value?: StringFilter;
  onChange?: (datasourceFilters: StringFilter) => void;
  style?: React.CSSProperties;
}> = ({datasources, value, onChange, style}) => {
  const [selectedDatasource, setSelectedDatasource] = React.useState<string>(
    value?.include?.[0] || ""
  );

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
