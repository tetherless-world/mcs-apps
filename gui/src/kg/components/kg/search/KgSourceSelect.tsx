import * as React from "react";

import {Select, MenuItem, Paper} from "@material-ui/core";
import {StringFilter} from "shared/models/kg/search/StringFilter";
import {KgSource} from "shared/models/kg/source/KgSource";

export const KgSourceSelect: React.FunctionComponent<{
  containerClassName?: string;
  sources: KgSource[];
  selectClassName?: string;
  value?: StringFilter;
  onChange?: (datasourceFilters: StringFilter) => void;
}> = ({containerClassName, selectClassName, sources, value, onChange}) => {
  const [selectedSource, setSelectedSource] = React.useState<string>(
    value?.include?.[0] || ""
  );

  return (
    <Paper
      className={containerClassName}
      variant="outlined"
      square
      data-cy="sourceSelect"
    >
      <Select
        className={selectClassName}
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
              sources.find((source) => source.id === selected)!.label
            )}
          </span>
        )}
      >
        <MenuItem value="" data-cy="allSourcesSelectMenuItem">
          All Sources
        </MenuItem>
        {sources.map((source) => (
          <MenuItem
            key={source.id}
            value={source.id}
            data-cy="datasourceSelectMenuItem"
          >
            {source.label}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  );
};
