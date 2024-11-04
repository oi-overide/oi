export interface InitOption {
  ignore?: string[];
  verbose?: boolean;
  projectName?: string;
}

export interface StartOption {
  verbose?: boolean;
}

export interface ConfigOption {
  projectName?: string;
  ignore?: string[];
  global?: boolean;
  verbose?: boolean;
  setActive?: boolean;
  parser?: boolean;
}
