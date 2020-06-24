import * as React from "react";
import {ListItemAvatar} from "@material-ui/core";

export const BenchmarkAnswerChoiceAnalysisGraphLegendCircle: React.FunctionComponent<{
  radius?: number;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  border?: string;
}> = ({
  radius: userDefinedRadius,
  color: userDefinedColor,
  opacity: userDefinedOpacity,
  borderRadius: userDefinedBorderRadius,
  border,
}) => {
  const radius = userDefinedRadius ?? 20;
  const backgroundColor = userDefinedColor ?? "#999";
  const opacity = userDefinedOpacity ?? 1;
  const borderRadius = userDefinedBorderRadius ?? "50%";

  return (
    <ListItemAvatar>
      <div
        style={{
          height: radius + "px",
          width: radius + "px",
          borderRadius,
          backgroundColor,
          display: "inline-block",
          opacity,
          border,
        }}
      />
    </ListItemAvatar>
  );
};
