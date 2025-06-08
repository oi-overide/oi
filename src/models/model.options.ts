export interface InitOption {
  path?: string;
  ignore?: string[];
  verbose?: boolean;
  projectName?: string;
}

export interface StartOption {
  verbose?: boolean;
  path?: string;
}

export interface ConfigOption {
  name?: string;
  ignore?: string[];
  global?: boolean;
  verbose?: boolean;
  setActive?: boolean;
  parser?: boolean;
}
