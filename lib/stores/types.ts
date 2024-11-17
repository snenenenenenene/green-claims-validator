export interface FlowReference {
  sourceFlowId: string;
  targetFlowId: string;
  nodeId: string;
  type: "redirect" | "reference";
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ModalState {
  modalContent: null;
  isModalOpen: boolean;
  openModal: (content: any) => void;
  closeModal: () => void;
}

export interface QuestionnaireState {
  // Define questionnaire state and methods
}

export interface RootState extends QuestionnaireState, ModalState {}
