import { createContext } from "react";
import { Report } from "./use-reports";

export const Data = createContext<Report[]>([]);
