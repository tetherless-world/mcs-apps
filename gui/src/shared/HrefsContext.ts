import {Hrefs} from "shared/Hrefs";
import * as React from "react";

export const HrefsContext = React.createContext<Hrefs>(new Hrefs("/"));
