import { OpenAI } from "openai";
import CONFIG from "../config/config.js";
import OBJ from "../config/input-data.js";

const client = new OpenAI({
  baseURL: CONFIG.localURL,
  apiKey: CONFIG.localKey,
});

export const runCustomAI = async (inputParams, resumeText) => {
  const { aiType, jobInput } = inputParams;

  console.log("RUNNING AI");
  console.log(inputParams);

  //for my custom input
  const messageInput = await buildCustomMessageInput(jobInput);
  const schema = await buildCustomSchema();

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

  const res = await client.chat.completions.create(params);

  // const res = await client.responses.create(params);
  console.log("MODEL RESPONSE");
  console.log(res);

  return res.choices[0].message.content;
};

export const buildCustomMessageInput = async (jobInput) => {
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
- You will need to output new resume text that is tailored to the job description following the rules and schema format provided. Only output valid JSON based on the schema, nothing else.

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
  const jobOptions = await buildJobOptions();
  if (!jobOptions) return null;

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
              items: {
                oneOf: jobOptions,
              },
              minItems: jobOptions.length,
              maxItems: jobOptions.length,
            },
          },
        },
        required: ["summary", "experience"],
      },
    },
  };

  return schema;
};

export const buildJobOptions = async () => {
  const { jobArray } = CONFIG;
  if (!jobArray) return null;

  const jobOptions = [];
  for (let i = 0; i < jobArray.length; i++) {
    const job = jobArray[i];
    const { jobId, company, role, timeframe } = job;

    const jobObj = {
      type: "object",
      properties: {
        jobId: { type: "number", const: jobId },
        role: { type: "string", const: role },
        company: { type: "string", const: company },
        timeframe: { type: "string", const: timeframe },
        bullets: {
          type: "array",
          items: {
            type: "string",
            description:
              "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
          },
        },
      },
      required: ["jobId", "role", "company", "timeframe", "bullets"],
    };

    jobOptions.push(jobObj);
  }

  return jobOptions;
};

export const runDefaultAI = async (inputParams) => {
  const resumeText = await extractResumeText(inputPath);
};

export const runChatGPT = async (resumeText, jobInput) => {};

//=--------------------------

// export const buildSchema = async () => {
//   const schema = {
//     type: "json_schema",
//     json_schema: {
//       name: "resume_enhancement",
//       schema: {
//         type: "object",
//         properties: {
//           summarySection: {
//             type: "string",
//             description:
//               "A concise summary of experiences and achievements that are relevant to the job description. Goes at the top of the resume, after the name and contact information. Keep it short, but be engaging, and designed to get past ATS filters. Should be no more than 2-3 sentences.",
//           },
//           experiencesSection: {
//             type: "array",
//             description:
//               "A list of experiences and achievements that are relevant to the job description. Goes after the summary section. You need to include at least 5 of these items (especially the most recent ones), depending on the job description. Keep the content short, but be engaging, and designed to get past ATS filters.",
//             items: [
//               {
//                 type: "object",
//                 properties: {
//                   jobId: 1,
//                   jobName: "DPRK Cyber Threat Analyst",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "December 2023 - Present",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },
//               {
//                 type: "object",
//                 properties: {
//                   jobId: 2,
//                   jobName: "Online Operator, Social Engineering",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "February 2016 - Present",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },

//               {
//                 type: "object",
//                 properties: {
//                   jobId: 3,
//                   jobName: "Cyber Criminal Threat Analyst",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "May 2023 - December 2023",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },
//               {
//                 type: "object",
//                 properties: {
//                   jobId: 4,
//                   jobName: "Embedded Liaison Officer with USIC partner, Counterterrorism",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "November 2021 - May 2023",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },

//               {
//                 type: "object",
//                 properties: {
//                   jobId: 5,
//                   jobName: "Counterterrorism Division, Tactical Analyst, Program Manager",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "July 2015 - May 2023",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },

//               {
//                 type: "object",
//                 properties: {
//                   jobId: 6,
//                   jobName: "Presidential Daily Briefer for FBI Director and Attorney General",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "2015-2018",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },
//               {
//                 type: "object",
//                 properties: {
//                   jobId: 7,
//                   jobName: "Electronic Communications Analyst",
//                   company: "Federal Bureau of Investigation",
//                   timeFrame: "September 2010 - July 2015",
//                   bullets: {
//                     type: "array",
//                     items: {
//                       type: "string",
//                       description:
//                         "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                     },
//                   },
//                 },
//                 required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
//               },
//             ],
//           },
//         },
//         required: ["summarySection", "experiencesSection"],
//         additionalProperties: false,
//       },
//     },
//   };
//   return schema;
// };

// export const buildSchema = async () => {
//   const schema = {
//     type: "json_schema",
//     json_schema: {
//       name: "resume_enhancement",
//       schema: {
//         type: "object",
//         properties: {
//           summary: {
//             type: "string",
//             description:
//               "A concise summary of experiences and achievements that are relevant to the job description. Keep it short, but be engaging, and designed to get past ATS filters.",
//           },
//           experiences: {
//             type: "array",
//             description:
//               "A list of experiences and achievements that are relevant to the job description. Keep it short, but be engaging, and designed to get past ATS filters.",
//             items: {
//               type: "object",
//               properties: {
//                 company: { type: "string", description: "The company name." },
//                 position: { type: "string", description: "The position title." },
//                 bullets: {
//                   type: "array",
//                   items: {
//                     type: "string",
//                     description:
//                       "A bullet point of the experience and achievements. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
//                   },
//                 },
//               },
//               required: ["company", "position", "bullets"],
//             },
//           },
//           required: ["summary", "experiences"],
//         },
//         additionalProperties: false,
//       },
//     },
//   };
//   return schema;
// };s
