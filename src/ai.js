import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "balls",
});

export const runAI = async (resumeText, inputParams) => {
  const { aiType, jobInput } = inputParams;

  console.log("RUNNING AI");
  console.log(inputParams);

  //build local as default
  if (aiType === "chatgpt") return await runChatGPT(resumeText, jobInput);

  const messageInput = await buildMessageInput(resumeText, jobInput);
  const schema = await buildSchema();

  const params = {
    // model: "meta-llama-3.1-8b-instruct",
    model: "meta-llama-3.1-8b-instruct",
    messages: messageInput,
    response_format: schema,
    // temperature: 0.9,
  };

  console.log("AI PARAMS");
  console.log(params);

  const res = await client.chat.completions.create(params);

  // const res = await client.responses.create(params);
  console.log("MODEL RESPONSE");
  console.log(res);

  return res.choices[0].message.content;
};

export const buildMessageInput = async (resumeText, jobInput) => {
  const messageInput = [
    {
      role: "system",
      content: `You are a resume optimization expert. You enhance resume text to match job descriptions while keeping achievements truthful. Always respond with valid JSON only.

## Instructions:

Your job is to take the provided Resume and Job Description and output a new resume that is specifically tailored to the job description. 

In order for me to inject your output into a resume, I want you to provide different parts / sections of the new resume text in a structured format defined in the json schema. 

To do this you will be provided with the following information:

- A Job Description (labeled as "Job Description") and a Resume (labeled as "Resume").

- You will need to output new resume text that is tailored to the job description following the rules and schema format provided. Only output valid JSON based on the schema, nothing else.

## Rules:

Please follow the following rules when outputting the new resume text:

- The new resume text should be highly professional and formal, and should be concise and easy to read.
- The new resume should contain many action verbs and keywords, and be optimized to pass ATS filters.
- The new resume text should be truthful and accurate, optimize the content for the job description, do NOT invent new experiences or achievements.
- Do NOT invent or make up any information in the new resume that is not provided in the original resume.
- Do NOT reference the original resume or that this is a new resume.
- Do NOT use markdown formatting, or other formatting not in the original resume. Just the plain text.
- Please follow the schema format provided exactly, nothing else.
`,
    },
    {
      role: "user",
      content: `Here is the original Resume: <original_resume>${resumeText}</original_resume>

And here is the Job Description: <job_description>${jobInput}</job_description>`,
    },
  ];

  return messageInput;
};

export const buildSchema = async () => {
  const schema = {
    type: "json_schema",
    json_schema: {
      name: "resume_enhancement",
      schema: {
        type: "object",
        properties: {
          summarySection: {
            type: "string",
            description:
              "A concise summary of experiences and achievements that are relevant to the job description. Goes at the top of the resume, after the name and contact information. Keep it short, but be engaging, and designed to get past ATS filters. Should be no more than 2-3 sentences.",
          },
          experiencesSection: {
            type: "array",
            description:
              "A list of experiences and achievements that are relevant to the job description. Goes after the summary section. You need to include at least 5 of these items (especially the most recent ones), depending on the job description. Keep the content short, but be engaging, and designed to get past ATS filters.",
            items: [
              {
                type: "object",
                properties: {
                  jobId: 1,
                  jobName: "DPRK Cyber Threat Analyst",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "December 2023 - Present",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },
              {
                type: "object",
                properties: {
                  jobId: 2,
                  jobName: "Online Operator, Social Engineering",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "February 2016 - Present",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },

              {
                type: "object",
                properties: {
                  jobId: 3,
                  jobName: "Cyber Criminal Threat Analyst",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "May 2023 - December 2023",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },
              {
                type: "object",
                properties: {
                  jobId: 4,
                  jobName: "Embedded Liaison Officer with USIC partner, Counterterrorism",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "November 2021 - May 2023",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },

              {
                type: "object",
                properties: {
                  jobId: 5,
                  jobName: "Counterterrorism Division, Tactical Analyst, Program Manager",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "July 2015 - May 2023",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },

              {
                type: "object",
                properties: {
                  jobId: 6,
                  jobName: "Presidential Daily Briefer for FBI Director and Attorney General",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "2015-2018",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },
              {
                type: "object",
                properties: {
                  jobId: 7,
                  jobName: "Electronic Communications Analyst",
                  company: "Federal Bureau of Investigation",
                  timeFrame: "September 2010 - July 2015",
                  bullets: {
                    type: "array",
                    items: {
                      type: "string",
                      description:
                        "A bullet point of the experience and achievements at this position. Use action verbs and keywords to make it engaging and designed to get past ATS filters.",
                    },
                  },
                },
                required: ["jobId", "jobName", "company", "timeFrame", "bullets"],
              },
            ],
          },
        },
        required: ["summarySection", "experiencesSection"],
        additionalProperties: false,
      },
    },
  };
  return schema;
};

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
// };

export const runChatGPT = async (resumeText, jobInput) => {};
