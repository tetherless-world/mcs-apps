import * as React from "react";

import {Select, MenuItem, Paper} from "@material-ui/core";
import {StringFilter} from "shared/models/StringFilter";

export const KgSourceSelect: React.FunctionComponent<{
  sources: string[];
  value?: StringFilter;
  onChange?: (datasourceFilters: StringFilter) => void;
  style?: React.CSSProperties;
}> = ({sources, value, onChange, style}) => {
  const [selectedSource, setSelectedSource] = React.useState<string>(
    value?.include?.[0] || ""
  );

  return (
    <Paper variant="outlined" square style={style} data-cy="datasourceSelect">
      <Select
        displayEmpty
        value={selectedSource}
        onChange={(event: React.ChangeEvent<{value: unknown}>) => {
          const value = event.target.value as string;

          setSelectedSource(value);

          if (onChange) {
            onChange(value.length > 0 ? {include: [value]} : {});
          }
        }}
        renderValue={(selected) => (
          <span style={{marginLeft: "5px"}} data-cy="value">
            {(selected as string).length === 0 ? (
              <React.Fragment>All sources</React.Fragment>
            ) : (
              (selected as string)
            )}
          </span>
        )}
      >
        <MenuItem value="" data-cy="allDatasourcesSelectMenuItem">
          All Sources
        </MenuItem>
        {sources.map((source) => (
          <MenuItem
            key={source}
            value={source}
            data-cy="datasourceSelectMenuItem"
          >
            {source}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  );
};
