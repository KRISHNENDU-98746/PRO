
export enum ComponentType {
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
  INPUT_TEXT = 'INPUT_TEXT',
  BUTTON = 'BUTTON',
  OUTPUT_TEXT = 'OUTPUT_TEXT',
  OUTPUT_IMAGE = 'OUTPUT_IMAGE',
}

export enum ActionType {
  GENERATE_TEXT = 'GENERATE_TEXT',
  GENERATE_IMAGE = 'GENERATE_IMAGE',
}

export interface BaseAppComponent {
  id: string;
  type: ComponentType;
}

export interface TitleComponent extends BaseAppComponent {
  type: ComponentType.TITLE;
  content: string;
}

export interface DescriptionComponent extends BaseAppComponent {
  type: ComponentType.DESCRIPTION;
  content: string;
}

export interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface InputTextComponent extends BaseAppComponent {
  type: ComponentType.INPUT_TEXT;
  label: string;
  placeholder?: string;
  validation?: InputValidation;
}

export interface ButtonComponent extends BaseAppComponent {
  type: ComponentType.BUTTON;
  label:string;
  action: ActionType;
  triggers: string[]; // Array of input component IDs
}

export interface OutputTextComponent extends BaseAppComponent {
  type: ComponentType.OUTPUT_TEXT;
  displaysFor: string; // ID of the button that generates this output
}

export interface OutputImageComponent extends BaseAppComponent {
  type: ComponentType.OUTPUT_IMAGE;
  displaysFor: string; // ID of the button that generates this output
}

export type AppComponent =
  | TitleComponent
  | DescriptionComponent
  | InputTextComponent
  | ButtonComponent
  | OutputTextComponent
  | OutputImageComponent;

export interface AppConfig {
  components: AppComponent[];
}
