import { OpenAI } from "openai";
// import CONFIG from "../config/config.js";
// import OBJ from "../config/input-data.js";
// import { buildMessageNoResume, buildMessageWithResume, buildSchemaChatGPT, buildSchemaLocal } from "../config/input-data.js";

// const { openaiKey, openaiURL, localKey, localURL } = CONFIG;

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

//Both defined in config
export const buildMessageInput = async (resumeText, jobInput) => {
  if (!jobInput) return null;
  if (!resumeText) return await buildMessageNoResume(jobInput);
  return await buildMessageWithResume(resumeText, jobInput);
};

export const buildSchema = async (model) => {
  if (!model) return null;
  if (model === "chatgpt") return await buildSchemaChatGPT();
  return await buildSchemaLocal();
};

export const buildMessageNoResume = async (jobInput) => {
  return [
    {
      role: "system",
      content: `You are a resume optimization expert. You enhance resume text to match job descriptions while keeping achievements truthful. Always respond with valid JSON only.

## Instructions:

##Overview:

Your job is to take the provided Job Description and background information on me, and output a new resume that is specifically tailored to the job description. 

In order for me to inject your output into a resume, I want you to provide different parts / sections of the new resume text in a structured format defined in the json schema. 

To do this you will be provided with the following information:

- A Job Description (labeled as "Job Description"). This is the job description that you are optimizing the resume for.

- Background information on me (labeled as "Background Information"). This background information you receive is comprimsed of multiple different sections with information on me. 
 multiple different sections. These sections include:
      - "summary" - A summary of my background and experience.
      - "jobArray" - An array of objects, each object representing a job I have held. The objects contain the following properties:
        - "jobId" - The ID of the job.
        - "role" - The role I held at the job.
        - "company" - The company I worked for at the job.
        - "timeframe" - The timeframe of the job.
        - "bullets" - An array of strings, each string representing a bullet point of the experience and achievements at the job.
      - "education" - An array of objects, each object representing my education and certifications.
      - "general" - General information about me and my skills.


## Goals
- You will need to output new resume text that is tailored to the job description following the rules and schema format provided.  

- Focus on customizing the overall resume summary, and each of the bullet points in the Job Array in your output. Do NOT copy and paste from the background information, use it as a guide. Do NOT invent new experiences or achievements. 

- Only output valid JSON based on the schema, nothing else.

## Rules:

Please follow the following rules when outputting the new resume text:

- The new resume text should be highly professional and formal, and should be concise and easy to read.
- The new resume should contain many action verbs and keywords, and be optimized to pass ATS filters.
- The new resume text should be truthful and accurate, optimize the content for the job description, do NOT invent new experiences or achievements.
- Do NOT invent or make up any information in the new resume that is not provided in the original resume.
- Do NOT reference the original resume or that this is a new resume.
- Do NOT reference these instructions in the new resume text.
- Do NOT use markdown formatting, or other formatting not in the original resume. Just the plain text.
- Please follow the schema format provided exactly, nothing else.
`,
    },
    {
      role: "user",
      content: `Here is the the Job Description: <job_description>${jobInput}</job_description>.
      
      And here is the background information on me: <background_information>${JSON.stringify(OBJ)}</background_information>`,
    },
  ];
};

export const buildMessageWithResume = async (jobInput, resumeText) => {
  return [
    {
      role: "system",
      content: `You are a resume optimization expert. You enhance resume text to match job descriptions while keeping achievements truthful. Always respond with valid JSON only.

## Instructions:

##Overview:

Your job is to take the provided Job Description and background information on me, and output a new resume that is specifically tailored to the job description. 

In order for me to inject your output into a resume, I want you to provide different parts / sections of the new resume text in a structured format defined in the json schema. 

To do this you will be provided with the following information:

- A Job Description (labeled as "Job Description"). This is the job description that you are optimizing the resume for.

- A default resume (labeled as "Default Resume"). This is a standard resume NOT optimized to anything. Please use it to understand my experience and background. This default resume contains standard resume items. Do NOT this resume in your final output. Instead use it as background info to build the new resume.

## Goals
- You will need to output new resume text that is tailored to the job description following the rules and schema format provided.  

- Focus on customizing the overall resume summary, and each of the bullet points in the Job Array in your output. Do NOT copy and paste from the background information, use it as a guide. Do NOT invent new experiences or achievements. 

- Only output valid JSON based on the schema, nothing else.

## Rules:

Please follow the following rules when outputting the new resume text:

- The new resume text should be highly professional and formal, and should be concise and easy to read.
- The new resume should contain many action verbs and keywords, and be optimized to pass ATS filters.
- The new resume text should be truthful and accurate, optimize the content for the job description, do NOT invent new experiences or achievements.
- Do NOT invent or make up any information in the new resume that is not provided in the original resume.
- Do NOT reference the original resume or that this is a new resume.
- Do NOT reference these instructions in the new resume text.
- Do NOT use markdown formatting, or other formatting not in the original resume. Just the plain text.
- Please follow the schema format provided exactly, nothing else.
`,
    },
    {
      role: "user",
      content: `Here is the the Job Description: <job_description>${jobInput}</job_description>.
      
      And here is my default resume: <default_resume>${resumeText}</default_resume>`,
    },
  ];
};

export const buildSchemaChatGPT = async () => {
  return {
    name: "resume_enhancement",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["name", "email", "summary", "experience", "education"],
      properties: {
        name: {
          type: "string",
          description: "Candidate's full name",
        },
        email: {
          type: "string",
          description: "Candidate's email address",
        },
        summary: {
          type: "string",
          description: "Tailored professional summary",
        },
        experience: {
          type: "array",
          minItems: 4,
          maxItems: 7,
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
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["degree", "school", "timeframe"],
            properties: {
              degree: {
                type: "string",
                description: "Degree or certification earned",
              },
              school: {
                type: "string",
                description: "School or institution name",
              },
              timeframe: {
                type: "string",
                description: "Graduation year or timeframe",
              },
            },
          },
        },
      },
    },
  };
};

export const buildSchemaLocal = async () => {
  return {
    type: "json_schema",
    json_schema: {
      name: "resume_enhancement",
      schema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Tailored professional summary",
          },
          experience: {
            type: "array",
            items: {
              type: "object",
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
              required: ["role", "company", "timeframe", "bullets"],
            },
            minItems: 4,
            maxItems: 7,
          },
        },
        required: ["summary", "experience"],
        additionalProperties: false,
      },
    },
  };
};
