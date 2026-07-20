import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { buildScreenerMessageInput, buildSchema } from "./message.js";

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

const SCREENER_MIN_TOKENS = 16000;

export const runTwoPassAI = async (inputParams) => {
  const builderStartedAt = Date.now();
  const draftText = await runSendToAI(inputParams);
  console.log(`Resume builder pass completed in ${Date.now() - builderStartedAt}ms`);
  if (!draftText) return null;
  if (!parseResumeJSON(draftText)) {
    console.warn("Resume builder returned invalid draft JSON; skipping screener pass");
    return draftText;
  }

  try {
    return await runScreenerPass(inputParams, draftText);
  } catch (error) {
    console.error("Resume screener pass failed; returning builder draft:", error.message);
    return draftText;
  }
};

const runScreenerPass = async (inputParams, draftText) => {
  const { screenerAiType, screenerModelType, mode, messageInput, maxTokens, temperature, serviceTier } = inputParams;
  const messageInputScreener = await buildScreenerMessageInput(messageInput, draftText, mode);
  const schema = await buildSchema(screenerAiType, mode, true);
  if (!messageInputScreener || !schema) throw new Error("could not build screener request");
  const startedAt = Date.now();
  const screenerText = await runSendToAI({ aiType: screenerAiType, modelType: screenerModelType, messageInput: messageInputScreener, schema, temperature, serviceTier, maxTokens: Math.max(+maxTokens, SCREENER_MIN_TOKENS) });
  console.log(`Resume screener pass completed in ${Date.now() - startedAt}ms`);
  const screenerResume = parseResumeJSON(screenerText);
  if (!screenerResume || typeof screenerResume.audit !== "string") {
    console.warn("Resume screener returned invalid JSON; returning builder draft");
    return draftText;
  }
  console.log("Resume screener audit:", screenerResume.audit);
  return screenerText;
};

const parseResumeJSON = (text) => {
  if (typeof text !== "string") return null;
  const cleanedText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const value = JSON.parse(cleanedText);
    if (!value || typeof value !== "object" || typeof value.summary !== "string" || !Array.isArray(value.experience) || !Array.isArray(value.skills)) return null;
    return value;
  } catch (error) {
    console.warn("Failed to parse AI resume JSON:", error.message);
    return null;
  }
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
      system: [{ type: "text", text: systemContent, cache_control: { type: "ephemeral", ttl: "1h" } }],
      messages: userMessages,
      output_config: { format: { type: "json_schema", schema: schema.schema } },
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.text ?? null;
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
