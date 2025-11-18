
import React, { useState, useCallback, useMemo } from 'react';
import { AppConfig, AppComponent, ComponentType, ActionType, InputTextComponent, InputValidation } from '../types';
import { executeAppAction } from '../services/geminiService';
import Loader from './Loader';
import { SparklesIcon } from './icons';

interface AppRendererProps {
  config: AppConfig;
}

const validateInput = (value: string, validation?: InputValidation): string | null => {
  if (!validation) return null;

  const trimmedValue = value.trim();

  if (validation.required && !trimmedValue) {
    return 'This field is required.';
  }
  if (validation.minLength && trimmedValue.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters long.`;
  }
  if (validation.maxLength && trimmedValue.length > validation.maxLength) {
    return `Cannot be more than ${validation.maxLength} characters long.`;
  }

  return null;
};


const AppRenderer: React.FC<AppRendererProps> = ({ config }) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [outputValues, setOutputValues] = useState<Record<string, string>>({});
  const [executingState, setExecutingState] = useState<Record<string, { loading: boolean; error: string | null }>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const textInputs = useMemo(() =>
    config.components.filter(c => c.type === ComponentType.INPUT_TEXT) as InputTextComponent[],
    [config.components]
  );

  const handleInputChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
    const component = textInputs.find(c => c.id === id);
    if (component) {
      const errorMessage = validateInput(value, component.validation);
      setErrors(prev => ({ ...prev, [id]: errorMessage }));
    }
  };

  const handleButtonClick = useCallback(async (buttonId: string, action: ActionType, triggers: string[]) => {
    let hasErrors = false;
    const newErrors: Record<string, string | null> = { ...errors };

    for (const triggerId of triggers) {
        const component = textInputs.find(c => c.id === triggerId);
        if (component) {
            const value = inputValues[triggerId] || '';
            const errorMessage = validateInput(value, component.validation);
            if (errorMessage) {
                newErrors[triggerId] = errorMessage;
                hasErrors = true;
            }
        }
    }
    setErrors(newErrors);
    if (hasErrors) return;


    setExecutingState(prev => ({ ...prev, [buttonId]: { loading: true, error: null } }));

    const inputsToExecute: Record<string, string> = {};
    for (const triggerId of triggers) {
      inputsToExecute[triggerId] = inputValues[triggerId] || '';
    }

    try {
      const result = await executeAppAction(action, inputsToExecute);
      setOutputValues(prev => ({ ...prev, [buttonId]: result }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setExecutingState(prev => ({ ...prev, [buttonId]: { loading: false, error: errorMessage } }));
    } finally {
      setExecutingState(prev => ({ ...prev, [buttonId]: { ...prev[buttonId], loading: false } }));
    }
  }, [inputValues, textInputs, errors]);

  const renderComponent = (component: AppComponent) => {
    switch (component.type) {
      case ComponentType.TITLE:
        return <h1 key={component.id} className="text-3xl font-bold text-brand-text-primary">{component.content}</h1>;
      
      case ComponentType.DESCRIPTION:
        return <p key={component.id} className="text-brand-text-secondary mt-2">{component.content}</p>;

      case ComponentType.INPUT_TEXT:
        const error = errors[component.id];
        return (
          <div key={component.id} className="w-full mt-4">
            <label htmlFor={component.id} className="block text-sm font-medium text-brand-text-secondary mb-1">{component.label}</label>
            <textarea
              id={component.id}
              value={inputValues[component.id] || ''}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              placeholder={component.placeholder || ''}
              rows={4}
              className={`w-full bg-brand-bg border rounded-md p-2 focus:ring-2 transition duration-200 resize-none ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-border focus:ring-brand-primary focus:border-brand-primary'}`}
              aria-invalid={!!error}
              aria-describedby={error ? `${component.id}-error` : undefined}
            />
            {error && <p id={`${component.id}-error`} className="mt-1 text-sm text-red-400">{error}</p>}
          </div>
        );

      case ComponentType.BUTTON:
        const isLoading = executingState[component.id]?.loading;
        const hasInputErrors = component.triggers.some(triggerId => !!errors[triggerId]);
        return (
          <button
            key={component.id}
            onClick={() => handleButtonClick(component.id, component.action, component.triggers)}
            disabled={isLoading || hasInputErrors}
            className="w-full mt-6 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition duration-200 disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <> <SparklesIcon className="w-5 h-5 mr-2" /> {component.label} </>}
          </button>
        );

      case ComponentType.OUTPUT_TEXT:
        const outputText = outputValues[component.displaysFor];
        const textError = executingState[component.displaysFor]?.error;
        if (!outputText && !textError && !executingState[component.displaysFor]?.loading) return null;
        return (
          <div key={component.id} className="w-full mt-6 p-4 bg-brand-bg border border-brand-border rounded-md min-h-[100px]">
            <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Result</h3>
            {executingState[component.displaysFor]?.loading ? <Loader/> :
             textError ? <p className="text-red-400">{textError}</p> : <p className="text-brand-text-primary whitespace-pre-wrap">{outputText}</p>
            }
          </div>
        );

      case ComponentType.OUTPUT_IMAGE:
        const outputImage = outputValues[component.displaysFor];
        const imageError = executingState[component.displaysFor]?.error;
        if (!outputImage && !imageError && !executingState[component.displaysFor]?.loading) return null;
        return (
          <div key={component.id} className="w-full mt-6 p-4 bg-brand-bg border border-brand-border rounded-md min-h-[100px]">
            <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Generated Image</h3>
            {executingState[component.displaysFor]?.loading ? <Loader/> :
             imageError ? <p className="text-red-400">{imageError}</p> : <img src={outputImage} alt="Generated" className="rounded-md w-full object-contain" />
            }
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 md:p-6">
      {config.components.map(renderComponent)}
    </div>
  );
};

export default AppRenderer;
