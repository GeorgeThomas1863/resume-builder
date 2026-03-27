import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

let openaiClient = null;
let localClient = null;

export const buildClient = async (aiType) => {
  if (aiType === "chatgpt") return buildOpenAIClient();
  if (aiType === "local") return buildLocalClient();
  if (aiType === "claude") return buildAnthropicClient();
  return null;
};

export const buildOpenAIClient = () => {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });
  return openaiClient;
};

export const buildLocalClient = () => {
  localClient = new OpenAI({
    apiKey: process.env.LOCAL_API_KEY,
    baseURL: process.env.LOCAL_API_BASE_URL,
  });
  return localClient;
};

export const buildAnthropicClient = () => {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 3_600_000 });
};

export const runSendToAI = async (inputParams) => {
  const { aiType } = inputParams;
  if (aiType === "chatgpt") return await runChatGPT(inputParams);
  if (aiType === "claude") return await runClaude(inputParams);

  //otherwise run local
  return await runLocalAI(inputParams);
};

export const runChatGPT = async (inputParams) => {
  const { messageInput, schema, modelType, serviceTier, maxTokens, temperature } = inputParams;
  // console.log("SENDING TO CHATGPT");

  const client = buildOpenAIClient();

  //OPEN AI THROWS ERROR, NEED CATCH TO SEE
  try {
    const data = await client.responses.create({
      // model: "gpt-5-nano", //testing
      model: modelType,
      input: messageInput,
      temperature: +temperature,
      max_output_tokens: +maxTokens,
      service_tier: serviceTier,
      text: {
        format: {
          type: "json_schema",
          name: schema.name,
          schema: schema.schema,
          strict: true,
        },
      },
    });

    // console.log("CHATGPT RESPONSE");
    // console.log(data);

    return data.output_text;
  } catch (e) {
    // console.log("ERROR RUNNING CHATGPT, ERROR MESSAGE:");
    // console.log(e);
    return null;
  }
};

export const runClaude = async (inputParams) => {
  const { messageInput, schema, modelType, maxTokens, temperature } = inputParams;
  const client = buildAnthropicClient();

  const systemContent = messageInput.find((m) => m.role === "system")?.content || "";
  const userMessages = messageInput.filter((m) => m.role !== "system");

  try {
    const response = await client.messages.create({
      model: modelType,
      max_tokens: +maxTokens,
      temperature: Math.min(+temperature, 1),
      system: systemContent,
      messages: userMessages,
      tools: [
        {
          name: schema.name,
          description: "Output the tailored resume as structured JSON",
          input_schema: schema.schema,
        },
      ],
      tool_choice: { type: "tool", name: schema.name },
    });

    const toolUseBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock) return null;
    return JSON.stringify(toolUseBlock.input);
  } catch (e) {
    console.error("runClaude error:", e?.status, e?.message, e?.error);
    return null;
  }
};

export const runLocalAI = async (inputParams) => {
  const { messageInput, schema, modelType, maxTokens, temperature } = inputParams;
  // console.log("RUNNING CUSTOM AI");
  // console.log(inputParams);

  const client = buildLocalClient();

  try {
    const params = {
      // model: "meta-llama-3.1-8b-instruct",
      model: modelType,
      messages: messageInput,
      response_format: schema,
      max_tokens: +maxTokens,
      temperature: +temperature,
    };

    // console.log("AI PARAMS");
    // console.log(params);

    const data = await client.chat.completions.create(params);
    // console.log("MODEL RESPONSE");
    // console.log(data);

    return data.choices[0].message.content;
  } catch (e) {
    // console.log("ERROR RUNNING LOCAL AI, ERROR MESSAGE:");
    // console.log(e);
    return null;
  }
};
