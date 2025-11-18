import { GoogleGenAI, Type } from "@google/genai";
import { AppConfig, ActionType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GenerationResult {
  explanation: string;
  filesChanged: string[];
  appConfig: AppConfig;
}

const appConfigSchema = {
  type: Type.OBJECT,
  properties: {
    theme: {
        type: Type.OBJECT,
        description: "The visual theme of the application.",
        properties: {
            primaryColor: { type: Type.STRING, description: "Primary color for buttons and highlights (hex code)." },
            secondaryColor: { type: Type.STRING, description: "Secondary color for accents (hex code).", nullable: true },
            backgroundColor: { type: Type.STRING, description: "Main background color for the app screen (hex code)." },
            surfaceColor: { type: Type.STRING, description: "Color for card backgrounds or surfaces (hex code)." },
            textColor: { type: Type.STRING, description: "Primary text color (hex code)." },
            secondaryTextColor: { type: Type.STRING, description: "Secondary text color for labels, placeholders (hex code)." },
            borderRadius: { type: Type.STRING, description: "The corner radius for elements like buttons and inputs (e.g., '8px', '12px')." },
            fontFamily: { type: Type.STRING, description: "The CSS font-family string. Use a font from Google Fonts like 'Inter, sans-serif' or 'Roboto, sans-serif'." },
        },
        required: ['primaryColor', 'backgroundColor', 'surfaceColor', 'textColor', 'secondaryTextColor', 'borderRadius', 'fontFamily']
    },
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
          variant: {
              type: Type.STRING,
              description: "The visual style of the button.",
              enum: ['primary', 'secondary', 'outline'],
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
  required: ["theme", "components"],
};

const generationResultSchema = {
    type: Type.OBJECT,
    properties: {
      explanation: {
        type: Type.STRING,
        description: "A friendly, conversational explanation of the changes being made or the app being generated. This will be shown to the user in the chat.",
      },
      filesChanged: {
        type: Type.ARRAY,
        description: "A list of files that were conceptually changed. For this tool, it should always be ['AppConfig JSON'].",
        items: { type: Type.STRING },
      },
      appConfig: appConfigSchema,
    },
    required: ["explanation", "filesChanged", "appConfig"],
};


interface GenerationParams {
  prompt: string;
  config?: AppConfig | null;
  history?: { role: 'user' | 'assistant', content: any }[];
}

export const generateOrRefineAppConfig = async ({ prompt, config = null, history = [] }: GenerationParams): Promise<GenerationResult> => {
  const isRefining = !!config;

  const systemInstruction = isRefining
    ? `You are a world-class AI application architect and a senior UI/UX designer. The user wants to modify an existing application. Your response MUST be a JSON object that strictly adheres to the schema.
1.  **Create an \`explanation\`:** In a friendly and conversational tone, explain what you are about to change and why, based on the user's request. For example: "Okay, I'll change the primary color to a nice shade of blue. This should give the app a calmer feel. I'll be updating the theme settings."
2.  **List \`filesChanged\`:** This will always be an array containing a single string: \`['AppConfig JSON']\`.
3.  **Provide the updated \`appConfig\`:** Return the complete, updated JSON configuration for the application in the \`appConfig\` field. Modify either the \`components\` array for functional changes or the \`theme\` object for UI/UX changes.`
    : `You are a world-class AI application architect and a senior UI/UX designer. Your task is to generate a JSON configuration for a new web application based on the user's prompt. Your response MUST be a JSON object that strictly adheres to the schema.
1.  **Create an \`explanation\`:** In a friendly tone, introduce the app you've designed. For example: "Great! I've designed a 'Baby Name Swiper' app for you. It has a clean and modern look. Here's the first version."
2.  **List \`filesChanged\`:** This will be \`['AppConfig JSON']\`.
3.  **Provide the initial \`appConfig\`:** Return the complete JSON configuration for the new application in the \`appConfig\` field. Design a beautiful, appropriate theme and a logical component structure.`;
  
  const fullPrompt = isRefining
    ? `Conversation History:\n${history.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n')}\n\nCurrent App Config:\n${JSON.stringify(config, null, 2)}\n\nUser's new request: ${prompt}`
    : prompt;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: generationResultSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    const newResult = JSON.parse(jsonText);
    return newResult as GenerationResult;
  } catch (error) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The AI returned an invalid app configuration. Please try again.");
  }
};

export const generateFlutterCode = async (config: AppConfig): Promise<string> => {
  const systemInstruction = `You are an expert Flutter developer. Your task is to convert a JSON object that describes an application's UI and theme into a single, complete, runnable Flutter code file (\`main.dart\`).
- The entire output must be a single block of Dart code. Do not wrap it in markdown.
- Use the provided \`theme\` object from the JSON to create a custom \`ThemeData\` for the \`MaterialApp\`. Map the theme colors to Flutter's \`ColorScheme\`.
- Use a \`StatefulWidget\` for the main screen to manage the state of input fields and output content.
- Map the JSON component types to appropriate Flutter widgets:
  - \`TITLE\`: \`Text\` widget with a large, bold style.
  - \`DESCRIPTION\`: \`Text\` widget with a standard style.
  - \`INPUT_TEXT\`: \`TextField\` widget, properly decorated with labels and placeholders from the JSON. Store its value in a \`TextEditingController\`.
  - \`BUTTON\`: \`ElevatedButton\`, \`TextButton\`, or \`OutlinedButton\` based on the \`variant\` property. For the \`onPressed\` callback, create a placeholder async function with a \`// TODO: Implement API call\` comment.
  - \`OUTPUT_TEXT\`: A \`Text\` widget that displays a state variable.
  - \`OUTPUT_IMAGE\`: An \`Image.network\` widget that displays a state variable holding an image URL. Initially, it should be hidden or show a placeholder.
- The overall layout should be a \`SingleChildScrollView\` containing a \`Padding\` widget whose child is a \`Column\`.
- Ensure the generated code is well-formatted and follows Dart best practices.
- Add necessary imports like \`package:flutter/material.dart\`.`;

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
