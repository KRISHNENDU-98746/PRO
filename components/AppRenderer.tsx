
import React, { useState, useCallback, useMemo } from 'react';
import { AppConfig, AppComponent, ComponentType, ActionType, InputTextComponent, InputValidation, Theme, ButtonComponent } from '../types';
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

  const { theme } = config;

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
    const componentThemeStyle = { fontFamily: theme.fontFamily };

    switch (component.type) {
      case ComponentType.TITLE:
        return <h1 key={component.id} style={{ ...componentThemeStyle, color: theme.textColor }} className="text-3xl font-bold">{component.content}</h1>;
      
      case ComponentType.DESCRIPTION:
        return <p key={component.id} style={{ ...componentThemeStyle, color: theme.secondaryTextColor }} className="mt-2">{component.content}</p>;

      case ComponentType.INPUT_TEXT:
        const error = errors[component.id];
        return (
          <div key={component.id} className="w-full mt-4">
            <label htmlFor={component.id} style={{ ...componentThemeStyle, color: theme.secondaryTextColor }} className="block text-sm font-medium mb-1">{component.label}</label>
            <textarea
              id={component.id}
              value={inputValues[component.id] || ''}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              placeholder={component.placeholder || ''}
              rows={4}
              style={{
                  ...componentThemeStyle,
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  borderRadius: theme.borderRadius,
                  borderColor: error ? '#ef4444' : theme.surfaceColor,
              }}
              className={`w-full border p-2 focus:ring-2 transition duration-200 resize-none`}
              onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.outline = 'none'; e.target.style.boxShadow = `0 0 0 2px ${theme.primaryColor}40`; }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : theme.surfaceColor; e.target.style.boxShadow = 'none';}}
              aria-invalid={!!error}
              aria-describedby={error ? `${component.id}-error` : undefined}
            />
            {error && <p id={`${component.id}-error`} className="mt-1 text-sm text-red-400">{error}</p>}
          </div>
        );

      case ComponentType.BUTTON:
        const isLoading = executingState[component.id]?.loading;
        const hasInputErrors = component.triggers.some(triggerId => !!errors[triggerId]);
        
        const btnComponent = component as ButtonComponent;
        const variant = btnComponent.variant || 'primary';
        let buttonStyle: React.CSSProperties = {
            ...componentThemeStyle,
            borderRadius: theme.borderRadius,
            border: '1px solid transparent',
        };

        if (variant === 'primary') {
            buttonStyle.backgroundColor = theme.primaryColor;
            buttonStyle.color = '#ffffff'; // Assuming light text on primary color
        } else if (variant === 'secondary' && theme.secondaryColor) {
            buttonStyle.backgroundColor = theme.secondaryColor;
            buttonStyle.color = '#ffffff'; // Assuming light text on secondary color
        } else if (variant === 'outline') {
            buttonStyle.backgroundColor = 'transparent';
            buttonStyle.color = theme.primaryColor;
            buttonStyle.borderColor = theme.primaryColor;
        }

        return (
          <button
            key={component.id}
            onClick={() => handleButtonClick(component.id, component.action, component.triggers)}
            disabled={isLoading || hasInputErrors}
            style={buttonStyle}
            className="w-full mt-6 font-semibold py-2 px-4 flex items-center justify-center transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <> <SparklesIcon className="w-5 h-5 mr-2" /> {component.label} </>}
          </button>
        );

      case ComponentType.OUTPUT_TEXT:
        const outputText = outputValues[component.displaysFor];
        const textError = executingState[component.displaysFor]?.error;
        if (!outputText && !textError && !executingState[component.displaysFor]?.loading) return null;
        return (
          <div key={component.id} style={{ backgroundColor: theme.backgroundColor, borderColor: theme.textColor+'20', borderRadius: theme.borderRadius }} className="w-full mt-6 p-4 border min-h-[100px]">
            <h3 style={{...componentThemeStyle, color: theme.secondaryTextColor}} className="text-sm font-semibold mb-2">Result</h3>
            {executingState[component.displaysFor]?.loading ? <Loader/> :
             textError ? <p className="text-red-400">{textError}</p> : <p style={{...componentThemeStyle, color: theme.textColor}} className="whitespace-pre-wrap">{outputText}</p>
            }
          </div>
        );

      case ComponentType.OUTPUT_IMAGE:
        const outputImage = outputValues[component.displaysFor];
        const imageError = executingState[component.displaysFor]?.error;
        if (!outputImage && !imageError && !executingState[component.displaysFor]?.loading) return null;
        return (
          <div key={component.id} style={{ backgroundColor: theme.backgroundColor, borderColor: theme.textColor+'20', borderRadius: theme.borderRadius }} className="w-full mt-6 p-4 border min-h-[100px]">
            <h3 style={{...componentThemeStyle, color: theme.secondaryTextColor}} className="text-sm font-semibold mb-2">Generated Image</h3>
            {executingState[component.displaysFor]?.loading ? <Loader/> :
             imageError ? <p className="text-red-400">{imageError}</p> : <img src={outputImage} alt="Generated" style={{ borderRadius: theme.borderRadius }} className="w-full object-contain" />
            }
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="h-full w-full p-4 md:p-6"
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}
    >
      <div 
        className="flex flex-col items-start gap-4 p-6 rounded-lg h-full w-full"
        style={{ backgroundColor: theme.surfaceColor, borderRadius: theme.borderRadius }}
      >
        {config.components.map(renderComponent)}
      </div>
    </div>
  );
};

export default AppRenderer;
