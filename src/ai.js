import { OpenAI } from "openai";
import CONFIG from "../config/config.js";
import OBJ from "../config/input-data.js";
import { buildMessageNoResume, buildMessageWithResume } from "../config/input-data.js";

const { openaiKey, openaiURL, localKey, localURL } = CONFIG;

const openaiClient = new OpenAI({
  apiKey: openaiKey,
  baseURL: openaiURL,
});

const localClient = new OpenAI({
  apiKey: localKey,
  baseURL: localURL,
});

export const runSendToAI = async (inputParams) => {
  const { aiType } = inputParams;
  if (aiType === "chatgpt") return await runChatGPT(inputParams);

  //otherwise run local
  return await runLocalAI(inputParams);
};

export const runChatGPT = async (inputParams) => {
  const { messageInput, schema, modelType, serviceTier, maxTokens, temperature } = inputParams;
  console.log("CHAT GPT INPUT PARAMS");
  console.log(inputParams);

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

export const runLocalAI = async (messageInput, schema) => {
  console.log("RUNNING CUSTOM AI");
  // console.log(inputParams);

  const params = {
    // model: "meta-llama-3.1-8b-instruct",
    model: "meta-llama-3.1-8b-instruct",
    messages: messageInput,
    response_format: schema,
    // temperature: 0.9,
  };

  console.log("AI PARAMS");
  console.log(params);

  // if (aiType === "chatgpt") return await runChatGPT(resumeText, jobInput);

  const data = await localClient.chat.completions.create(params);

  // const res = await client.responses.create(params);
  console.log("MODEL RESPONSE");
  console.log(data);

  return data.choices[0].message.content;
};

//MAKE THIS BETTER
export const buildMessageInput = async (resumeText, jobInput) => {
  if (!jobInput) return null;

  if (!resumeText) return await buildMessageNoResume(jobInput);
  return await buildMessageWithResume(resumeText, jobInput);
};

//BUILD IN FOR LOOP
export const buildSchema = async () => {
  const { jobArray } = OBJ;
  if (!jobArray || !jobArray.length) return null;

  const schema = {
    name: "resume_enhancement",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "experience"],
      properties: {
        summary: {
          type: "string",
          description: "Tailored professional summary",
        },
        experience: {
          type: "array",
          minItems: jobArray.length,
          maxItems: jobArray.length,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["role", "company", "timeframe", "bullets"],
            properties: {
              role: {
                type: "string",
                description: "Job title/role",
              },
              company: {
                type: "string",
                description: "Company name",
              },
              timeframe: {
                type: "string",
                description: "Employment timeframe or empty string",
              },
              bullets: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Array of bullet points describing responsibilities",
              },
            },
          },
        },
      },
    },
  };

  return schema;
};
