export const buildMessageInput = async (resumeText, jobInput) => {
  if (!jobInput) return null;
  const infoObj = await buildInfoObj();
  if (!resumeText) return await buildMessageNoResume(jobInput);
  return await buildMessageWithResume(resumeText, jobInput);
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
        company: "Federal Bureau of Investigation",
        role: "Online Operator, Social Engineering",
        timeframe: "2016 - Present",
        bullets: [
          "Operate online in support of investigations against various threat groups requiring substantial ideological expertise, independent judgement, and creativity",
          "Identify and penetrate online locations and groups with ongoing threat activity",
          "Disrupt physical threats by leveraging advanced subject matter expertise and technical capabilities",
        ],
      },
      {
        jobId: 3,
        company: "Federal Bureau of Investigation",
        role: "Cyber Threat Analyst, Criminal Actors",
        timeframe: "May 2023 - December 2023",
        bullets: [
          "Supported and oversaw FBI investigations on cyber actors involved in various criminal violations, including ransomware, sim swapping, business email compromise, social engineering, etc.",
          "Analyzed large criminal datasets to discover techniques indicative of nation state activity to focus resources",
        ],
      },
      {
        jobId: 4,
        company: "Federal Bureau of Investigation",
        role: "Embedded Liaison Officer with USIC partner, Counterterrorism",
        timeframe: "October 2021 - May 2023",
        bullets: [
          "Embedded with USIC partner working online CT threats to enable joint action and interagency collaboration",
          "Operated independently to represent Bureau equities with OGA partner in complex and crowded target environments to ensure unified USIC approach and avoid operational conflicts",
        ],
      },
      {
        jobId: 5,
        company: "Federal Bureau of Investigation",
        role: "Tactical Analyst / Program Manager, Counterterrorism",
        timeframe: "July 2015 - October 2021",
        bullets: [
          "Provided detailed tactical analytic support to identify targets of interest and disrupt active terrorist plots",
          "Managed and supported hundreds of counterterrorism investigations against multiple terrorist threat actors",
        ],
      },
      {
        jobId: 6,
        company: "Federal Bureau of Investigation",
        role: "Presidential Daily Briefer for FBI Director and Attorney General",
        timeframe: "2015-2018",
        bullets: [
          "Provided the Presidential Daily Briefing to the FBI Director, Attorney General, and senior FBI / DOJ executive management on approximately bimonthly basis",
          "Developed in depth expertise of security challenges, nation state adversaries, and diverse security topics",
        ],
      },
      {
        jobId: 7,
        company: "Federal Bureau of Investigation",
        role: "Social Media Threat Analyst, Counterterrorism",
        timeframe: "September 2010 - July 2015",
        bullets: [
          "Managed and supported numerous FBI cases involving imminent jihadist threats to the Homeland",
          "Analyzed, synthesized, and condensed large quantities of information to create tactical reports, analytical products, and strategic assessments for executive management",
        ],
      },
    ],

    education: [
      {
        school: "Catholic University of America",
        program: "undergraduate",
        degree1: "Bachelor of Arts in Political Science",
        degree2: "Bachelor of Arts in History",
        degree3: "Bachelor of Arts in Economics",
        timeframe: "2006-2010",
        graduation: "May 2010",
        notes: "Triple major in Political Science, History, and Economics; graduated magna cum laude, 3.6 GPA; Phi Beta Kappa.",
      },
      {
        school: "Georgetown University",
        degree: "Master of Arts in Security Studies",
        program: "graduate",
        timeframe: "2017-2019",
        graduation: "May 2019",
        notes: "International relations degree, focus on international security and current events.",
      },
      {
        certification: "GIAC Red Team Professional (GRTP)",
        dateCertified: "September 2025",
        program: "SANS Institute",
        company: "Global Information Assurance Certification (GIAC)",
        notes: "Red Team Professional certification, focus on red teaming and penetration testing.",
      },
      {
        certification: "GIAC Certified Incident Handler (GCIH)",
        dateCertified: "October 2024",
        program: "SANS Institute",
        company: "Global Information Assurance Certification (GIAC)",
        notes: "Certified Incident Handler certification, focus on incident handling and response.",
      },
      {
        certification: "GIAC Cyber Threat Intelligence (GCTI)",
        dateCertified: "August 2023",
        program: "SANS Institute",
        company: "Global Information Assurance Certification (GIAC)",
        notes: "Cyber Threat Intelligence certification, focus on threat intelligence and analysis.",
      },
      {
        certification: "GIAC Security Essentials (GSEC)",
        dateCertified: "July 2023",
        program: "SANS Institute",
        company: "Global Information Assurance Certification (GIAC)",
        notes: "Security Essentials certification, focus on security fundamentals and best practices.",
      },
    ],

    general: `I know the following programming languages well: VBA, JavaScript (NodeJs with Express and MongoDB). 
          I have used the following programming languages but have less experience with them: Python, SQL, HTML, CSS (which I despise).
          I am extremely proficient with Microsoft Excel and Access, and have extensive experience building advanced "full stack apps" with VBA in them. I am also experienced with PowerPoint, Word, etc.
          I have used GitHub for about about 1 year and have used it heavily to store my projects. 
          I have used Adobe Premier Pro, but I don't like to edit videos.
          I can deploy webapps to my own VPS and have done this for a couple years, by setting up and maintaining the server. I often use Cloudflare for my DNS. 
          I am extremely proficient with mobile messaging apps, especially Telegram. 
          I am a news junkie, and extremely familiar with international political events and trends, with a deep understanding of the geopolitical landscape.
          I am a student of history and have a deep knowledge of international cultures, and events. 
          I am very good at analyzing information, by identifying and evaluating sources and routinely follow claims back to their original primary source. This is my greatest strength.
          I know the recent history of the middle east, in particular the events of the Syrian Civil War, better than all but a handful of experts.
          `,
  };
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
