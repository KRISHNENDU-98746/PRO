
import { GoogleGenAI, Type } from "@google/genai";
import { AppConfig, ActionType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const appConfigSchema = {
  type: Type.OBJECT,
  properties: {
    components: {
      type: Type.ARRAY,
      description: "An array of UI components that make up the application.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "A unique identifier for the component, e.g., 'topic_input'. Use snake_case.",
          },
          type: {
            type: Type.STRING,
            description: "The type of the component.",
            enum: ['TITLE', 'DESCRIPTION', 'INPUT_TEXT', 'BUTTON', 'OUTPUT_TEXT', 'OUTPUT_IMAGE'],
          },
          content: {
            type: Type.STRING,
            description: "The text content for TITLE or DESCRIPTION components.",
            nullable: true,
          },
          label: {
            type: Type.STRING,
            description: "The user-facing label for INPUT_TEXT or BUTTON components.",
            nullable: true,
          },
          placeholder: {
            type: Type.STRING,
            description: "Placeholder text for INPUT_TEXT components.",
            nullable: true,
          },
          validation: {
            type: Type.OBJECT,
            description: "Validation rules for INPUT_TEXT components.",
            properties: {
              required: {
                type: Type.BOOLEAN,
                description: "Whether the input is required.",
                nullable: true,
              },
              minLength: {
                type: Type.INTEGER,
                description: "The minimum length for the input.",
                nullable: true,
              },
              maxLength: {
                type: Type.INTEGER,
                description: "The maximum length for the input.",
                nullable: true,
              },
            },
            nullable: true,
          },
          action: {
            type: Type.STRING,
            description: "The AI action this button performs.",
            enum: ['GENERATE_TEXT', 'GENERATE_IMAGE'],
            nullable: true,
          },
          triggers: {
            type: Type.ARRAY,
            description: "For BUTTONs, an array of 'id's of INPUT_TEXT components this button uses as input.",
            items: { type: Type.STRING },
            nullable: true,
          },
          displaysFor: {
            type: Type.STRING,
            description: "For OUTPUT components, the 'id' of the BUTTON that generates its content.",
            nullable: true,
          },
        },
        required: ["id", "type"],
      },
    },
  },
  required: ["components"],
};


export const generateAppConfig = async (prompt: string): Promise<AppConfig> => {
  const systemInstruction = `You are a world-class AI application architect. Your task is to generate a JSON configuration for a web application based on the user's prompt. The configuration must strictly adhere to the provided JSON schema.
- The \`components\` array should be ordered logically for the user interface.
- Always include a \`TITLE\` and a \`DESCRIPTION\` component at the start.
- For each component, only include the properties relevant to its \`type\`. For example, a \`TITLE\` component should only have \`id\`, \`type\`, and \`content\`. An \`INPUT_TEXT\` component should not have an \`action\` property.
- For \`INPUT_TEXT\` components, you can add validation rules. For example, if the user asks for a tweet generator, you could add \`"validation": {"required": true, "maxLength": 280}\` to the topic input.
- \`id\` values should be descriptive and use snake_case, e.g., \`main_title\`, \`topic_input\`, \`generate_button\`.
- The \`triggers\` array for a \`BUTTON\` must contain the \`id\`s of all \`INPUT_TEXT\` components whose values are needed for the action.
- The \`displaysFor\` property for an \`OUTPUT_\` component must be the \`id\` of the \`BUTTON\` that triggers its generation.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: appConfigSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    const config = JSON.parse(jsonText);
    return config as AppConfig;
  } catch (error) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The AI returned an invalid app configuration. Please try again.");
  }
};

export const generateFlutterCode = async (config: AppConfig): Promise<string> => {
  const systemInstruction = `You are an expert Flutter developer. Your task is to convert a JSON object that describes an application's UI into a single, complete, runnable Flutter code file (\`main.dart\`).
- The entire output must be a single block of Dart code. Do not wrap it in markdown.
- Use a \`StatefulWidget\` for the main screen to manage the state of input fields and output content.
- Map the JSON component types to appropriate Flutter widgets:
  - \`TITLE\`: \`Text\` widget with a large, bold style (\`Theme.of(context).textTheme.headlineMedium\`).
  - \`DESCRIPTION\`: \`Text\` widget with a standard style.
  - \`INPUT_TEXT\`: \`TextField\` widget, properly decorated with labels and placeholders from the JSON. Store its value in a \`TextEditingController\`.
  - \`BUTTON\`: \`ElevatedButton\` widget. For the \`onPressed\` callback, create a placeholder async function. Inside this function, add a \`// TODO: Implement Gemini API call here\` comment. Do not implement the API call logic.
  - \`OUTPUT_TEXT\`: A \`Text\` widget that displays a state variable.
  - \`OUTPUT_IMAGE\`: An \`Image.network\` widget that displays a state variable holding an image URL. Initially, it should be hidden or show a placeholder.
- The overall layout should be a \`SingleChildScrollView\` containing a \`Column\` with appropriate padding.
- Ensure the generated code is well-formatted and follows Dart best practices.
- Add necessary imports like \`package:flutter/material.dart\`.
- Create a basic \`MaterialApp\` and \`Scaffold\` structure.
- Do not make assumptions about API calls. The button's action is just a placeholder.`;

  const prompt = `Generate the Flutter code for the following app configuration:\n\n${JSON.stringify(config, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro", // Using a more powerful model for code generation
    contents: prompt,
    config: {
        systemInstruction,
    },
  });

  // Clean up the response to ensure it's just the code
  const code = response.text.replace(/^```dart\s*|```\s*$/g, '').trim();
  return code;
};


export const executeAppAction = async (action: ActionType, inputs: Record<string, string>): Promise<string> => {
  const prompt = Object.entries(inputs)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
    .join('\n');

  if (action === ActionType.GENERATE_TEXT) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } else if (action === ActionType.GENERATE_IMAGE) {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed.");
  }
  
  throw new Error(`Unsupported action: ${action}`);
};
