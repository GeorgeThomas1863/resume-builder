import { OpenAI } from "openai";
import CONFIG from "../config/config.js";
import OBJ from "../config/input-data.js";

const { openaiKey, openaiURL, localKey, localURL } = CONFIG;

const openaiClient = new OpenAI({
  apiKey: openaiKey,
  baseURL: openaiURL,
});

const localClient = new OpenAI({
  apiKey: localKey,
  baseURL: localURL,
});

export const runSendToAI = async (aiType, messageInput, schema) => {
  if (aiType === "chatgpt") return await runChatGPT(messageInput, schema);

  //otherwise run local
  return await runLocalAI(messageInput, schema);
};

export const runChatGPT = async (messageInput, schema) => {
  const data = await openaiClient.responses.create({
    model: "gpt-5-nano", //testing
    input: messageInput,
    response_format: schema,
  });

  console.log("CHATGPT RESPONSE");
  console.log(data);

  return data.output_parsed;
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
export const buildMessageInput = async (resumeText, aiType, jobInput) => {
  console.log("BUILDING CUSTOM MESSAGE INPUT");
  console.log(jobInput);

  const messageInput = [
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

  return messageInput;
};

//BUILD IN FOR LOOP
export const buildSchema = async () => {
  const { jobArray } = OBJ;
  if (!jobArray || !jobArray.length) return null;

  const schema = {
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
            minItems: jobArray.length,
            maxItems: jobArray.length,
          },
        },
        required: ["summary", "experience"],
        additionalProperties: false,
      },
    },
  };

  return schema;
};
