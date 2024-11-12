// stores/rootStore.ts

import { create } from "zustand";
import { RootState } from "../types";
import createChartSlice from "./chartSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createQuestionnaireSlice from "./questionnaireSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";

const useRootStore = create<RootState>((set, get) => ({
  ...createChartSlice(set, get),
  ...createQuestionnaireSlice(set, get),
  ...createCommitSlice(set, get),
  ...createVariableSlice(set, get),
  ...createModalSlice(set, get),
  ...createUtilitySlice(set, get),

  // Add any additional root-level state or methods here
}));

export default useRootStore;
