import * as React from "react";
import {Exception} from "@tetherless-world/twxplore-base";
import {Dialog, DialogContent, DialogTitle} from "@material-ui/core";

export const FatalErrorModal: React.FunctionComponent<{
  error?: Error;
  exception?: Exception;
  message?: string;
  onExit?: () => void;
}> = ({error, exception, message, onExit}) => {
  if (!onExit) {
    onExit = () => {
      return;
    };
  }
  if (!message) {
    if (error) {
      message = error.toString();
    } else if (exception) {
      message = exception.message;
    } else {
      message = "";
    }
  }

  return (
    <div>
      <Dialog open={true} onClose={onExit}>
        <DialogTitle>Fatal error</DialogTitle>
        <DialogContent>{message}</DialogContent>
      </Dialog>
    </div>
  );
};
