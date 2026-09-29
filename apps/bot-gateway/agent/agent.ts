import { createOpenAI } from "@ai-sdk/openai";
import { defineAgent, defineDynamic } from "eve";

const providerBaseUrl =
  process.env.COMMANDCODE_BASE_URL ??
  process.env.OPENCODE_BASE_URL ??
  "https://api.commandcode.ai/provider/v1";
const providerModel =
  process.env.COMMANDCODE_MODEL ??
  process.env.OPENCODE_MODEL ??
  "poolside/laguna-s-2.1-free";

export default defineAgent({
  model: defineDynamic({
    events: {
      "step.started": (_event, ctx) => {
        const apiKey = process.env.COMMANDCODE_API_KEY ?? process.env.OPENCODE_API_KEY;
        if (!apiKey) throw new Error("COMMANDCODE_API_KEY or OPENCODE_API_KEY is required.");
        const provider = createOpenAI({
          name: "commandcode",
          baseURL: providerBaseUrl,
          apiKey,
        });
        return {
          model: provider.responses(providerModel),
          modelContextWindowTokens: 131_072,
        };
      },
    },
  }),
  defaultTools: false,
});
