import { OpenAI } from "openai";

let openaiClient = null;
let localClient = null;

export const buildClient = async (aiType) => {
  if (aiType === "chatgpt") return buildOpenAIClient();
  if (aiType === "local") return buildLocalClient();
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

export const runSendToAI = async (inputParams) => {
  const { aiType } = inputParams;
  if (aiType === "chatgpt") return await runChatGPT(inputParams);

  //otherwise run local
  return await runLocalAI(inputParams);
};

export const runChatGPT = async (inputParams) => {
  const { messageInput, schema, modelType, serviceTier, maxTokens, temperature } = inputParams;
  console.log("SENDING TO CHATGPT");

  //OPEN AI THROWS ERROR, NEED CATCH TO SEE
  try {
    const data = await openaiClient.responses.create({
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

    console.log("CHATGPT RESPONSE");
    console.log(data);

    return data.output_text;
  } catch (e) {
    console.log("ERROR RUNNING CHATGPT, ERROR MESSAGE:");
    console.log(e);
    return null;
  }
};

export const runLocalAI = async (inputParams) => {
  const { messageInput, schema, modelType, maxTokens, temperature } = inputParams;
  console.log("RUNNING CUSTOM AI");
  // console.log(inputParams);

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

    const data = await localClient.chat.completions.create(params);
    // console.log("MODEL RESPONSE");
    // console.log(data);

    return data.choices[0].message.content;
  } catch (e) {
    console.log("ERROR RUNNING LOCAL AI, ERROR MESSAGE:");
    console.log(e);
    return null;
  }
};
