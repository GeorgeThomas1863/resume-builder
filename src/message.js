export const buildMessageInput = async (resumeText, jobInput, infoObj = null) => {
  if (!jobInput) return null;
  if (infoObj) return await buildMessagePrebuilt(resumeText, jobInput, infoObj);

  return await buildMessageDefault(resumeText, jobInput);
};

export const buildInfoObj = async () => {
  return {
    summary: process.env.SUMMARY,

    jobArray: [
      {
        jobId: 1,
        company: process.env.COMPANY_1,
        role: process.env.ROLE_1,
        timeframe: process.env.TIMEFRAME_1,
        bullets: [process.env.BULLETS_1_1, process.env.BULLETS_1_2, process.env.BULLETS_1_3, process.env.BULLETS_1_4, process.env.BULLETS_1_5],
        accomplishments: [
          process.env.ACCOMPLISHMENTS_1_1,
          process.env.ACCOMPLISHMENTS_1_2,
          process.env.ACCOMPLISHMENTS_1_3,
          process.env.ACCOMPLISHMENTS_1_4,
        ],
      },
      {
        jobId: 2,
        company: process.env.COMPANY_2,
        role: process.env.ROLE_2,
        timeframe: process.env.TIMEFRAME_2,
        bullets: [process.env.BULLETS_2_1, process.env.BULLETS_2_2, process.env.BULLETS_2_3],
        accomplishments: [
          process.env.ACCOMPLISHMENTS_2_1,
          process.env.ACCOMPLISHMENTS_2_2,
          process.env.ACCOMPLISHMENTS_2_3,
          process.env.ACCOMPLISHMENTS_2_4,
        ],
      },
      {
        jobId: 3,
        company: process.env.COMPANY_3,
        role: process.env.ROLE_3,
        timeframe: process.env.TIMEFRAME_3,
        bullets: [process.env.BULLETS_3_1, process.env.BULLETS_3_2],
        accomplishments: [process.env.ACCOMPLISHMENTS_3_1, process.env.ACCOMPLISHMENTS_3_2],
      },
      {
        jobId: 4,
        company: process.env.COMPANY_4,
        role: process.env.ROLE_4,
        timeframe: process.env.TIMEFRAME_4,
        bullets: [process.env.BULLETS_4_1, process.env.BULLETS_4_2],
        accomplishments: [process.env.ACCOMPLISHMENTS_4_1, process.env.ACCOMPLISHMENTS_4_2],
      },
      {
        jobId: 5,
        company: process.env.COMPANY_5,
        role: process.env.ROLE_5,
        timeframe: process.env.TIMEFRAME_5,
        bullets: [process.env.BULLETS_5_1, process.env.BULLETS_5_2],
      },
      {
        jobId: 6,
        company: process.env.COMPANY_6,
        role: process.env.ROLE_6,
        timeframe: process.env.TIMEFRAME_6,
        bullets: [process.env.BULLETS_6_1, process.env.BULLETS_6_2],
      },
      {
        jobId: 7,
        company: process.env.COMPANY_7,
        role: process.env.ROLE_7,
        timeframe: process.env.TIMEFRAME_7,
        bullets: [process.env.BULLETS_7_1, process.env.BULLETS_7_2],
      },
    ],

    education: [
      {
        school: process.env.SCHOOL_1,
        program: process.env.PROGRAM_1,
        degree1: process.env.DEGREE_1_1,
        degree2: process.env.DEGREE_1_2,
        degree3: process.env.DEGREE_1_3,
        timeframe: process.env.TIMEFRAME_1,
        graduation: process.env.GRADUATION_1,
        notes: process.env.NOTES_1,
      },
      {
        school: process.env.SCHOOL_2,
        program: process.env.PROGRAM_2,
        degree1: process.env.DEGREE_2_1,
        timeframe: process.env.TIMEFRAME_2,
        graduation: process.env.GRADUATION_2,
        notes: process.env.NOTES_2,
      },
      {
        certification: process.env.CERTIFICATION_1,
        dateCertified: process.env.DATE_CERTIFIED_1,
        program: process.env.PROGRAM_1,
        company: process.env.COMPANY_1,
        notes: process.env.NOTES_1,
      },
      {
        certification: process.env.CERTIFICATION_2,
        dateCertified: process.env.DATE_CERTIFIED_2,
        program: process.env.PROGRAM_2,
        company: process.env.COMPANY_2,
        notes: process.env.NOTES_2,
      },
      {
        certification: process.env.CERTIFICATION_3,
        dateCertified: process.env.DATE_CERTIFIED_3,
        program: process.env.PROGRAM_3,
        company: process.env.COMPANY_3,
        notes: process.env.NOTES_3,
      },
      {
        certification: process.env.CERTIFICATION_4,
        dateCertified: process.env.DATE_CERTIFIED_4,
        program: process.env.PROGRAM_4,
        company: process.env.COMPANY_4,
        notes: process.env.NOTES_4,
      },
    ],

    general: process.env.GENERAL_INFO,
  };
};

export const buildMessagePrebuilt = async (resumeText, jobInput, infoObj) => {
  if (!resumeText) return await buildMessagePrebuiltNoResume(jobInput, infoObj);
  return await buildMessagePrebuiltWithResume(resumeText, jobInput, infoObj);
};

export const buildMessagePrebuiltNoResume = async (jobInput, infoObj) => {
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
          - "accomplishments" - An array of strings, each string representing an accomplishment at the job.
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
        
        And here is the background information on me: <background_information>${JSON.stringify(infoObj)}</background_information>`,
    },
  ];
};

export const buildMessagePrebuiltWithResume = async (resumeText, jobInput, infoObj) => {
  return [
    {
      role: "system",
      content: `You are a resume optimization expert. You enhance resume text to match job descriptions while keeping achievements truthful. Always respond with valid JSON only.
  
  ## Instructions:
  
  ##Overview:
  
  Your job is to take the provided Job Description and background information on me, and output a new resume that is specifically tailored to the job description. 
  
  In order for me to inject your output into a resume, I want you to provide different parts / sections of the new resume text in a structured format defined in the json schema. 
  
  To do this you will be provided with the following information:
  
  - 1. A Job Description (labeled as "Job Description"). This is the job description that you are optimizing the resume for.
  
  - 2. Background information on me (labeled as "Background Information"). This background information you receive is comprimsed of multiple different sections with information on me. 
   multiple different sections. These sections include:
        - "summary" - A summary of my background and experience.
        - "jobArray" - An array of objects, each object representing a job I have held. The objects contain the following properties:
          - "jobId" - The ID of the job.
          - "role" - The role I held at the job.
          - "company" - The company I worked for at the job.
          - "timeframe" - The timeframe of the job.
          - "bullets" - An array of strings, each string representing a bullet point of the experience and achievements at the job.
          - "accomplishments" - An array of strings, each string representing an accomplishment at the job.
        - "education" - An array of objects, each object representing my education and certifications.
        - "general" - General information about me and my skills.
    
  
  -3. A default resume (labeled as "Default Resume"). This is a standard resume NOT optimized to anything. Please use it to understand my experience and background. This default resume contains standard resume items. Do NOT this resume in your final output. Instead use it as background info to build the new resume.
  
  
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
      Here is background information on me: <background_information>${JSON.stringify(infoObj)}</background_information>
      And here is my default resume: <default_resume>${resumeText}</default_resume>`,
    },
  ];
};

export const buildMessageDefault = async (jobInput, resumeText) => {
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

//++++++++++++++++++++++++++++++++++++

export const buildSchema = async (model) => {
  if (!model) return null;
  if (model === "chatgpt") return await buildSchemaChatGPT();
  return await buildSchemaLocal();
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
          minItems: 7,
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
            minItems: 7,
            maxItems: 7,
          },
        },
        required: ["summary", "experience"],
        additionalProperties: false,
      },
    },
  };
};
