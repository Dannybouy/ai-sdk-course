import {
  GoogleGenerativeAIProviderOptions,
  google as originalGoogle,
} from "@ai-sdk/google";
import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";

export const google = customProvider({
  languageModels: {
    fast: originalGoogle("gemini-2.5-flash"),
    smart: originalGoogle("gemini-2.5-pro"),
    reasoning: wrapLanguageModel({
      model: originalGoogle("gemini-2.5-flash"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            google: {
              thinkingConfig: {
                thinkingBudget: 8192,
                includeThoughts: true,
              },
            } satisfies GoogleGenerativeAIProviderOptions,
          },
        },
      }),
    }),
  },
  fallbackProvider: originalGoogle,
});
