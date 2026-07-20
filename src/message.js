import fs from "fs/promises";

const promptCache = {};

export const buildMessageInput = async (resumeText, jobInput, infoObj = null) => {
  if (!jobInput) return null;
  const mode = infoObj ? "prebuilt" : "upload";
  const prompt = await loadPrompt(`builder-${mode}.md`);
  if (!prompt) return null;
  return [{ role: "system", content: prompt }, { role: "user", content: buildBuilderUserContent(resumeText, jobInput, infoObj) }];
};

export const buildScreenerMessageInput = async (builderMessages, draftText, mode) => {
  if (!Array.isArray(builderMessages) || !draftText || !mode) return null;
  const prompt = await loadPrompt(`screener-${mode}.md`);
  const builderUser = builderMessages.find((message) => message.role === "user")?.content;
  if (!prompt || !builderUser) return null;
  return [{ role: "system", content: prompt }, { role: "user", content: `${builderUser}\n\n<draft_resume>${draftText}</draft_resume>` }];
};

const loadPrompt = async (fileName) => {
  if (promptCache[fileName]) return promptCache[fileName];
  try {
    promptCache[fileName] = await fs.readFile(new URL(`../prompts/${fileName}`, import.meta.url), "utf8");
    return promptCache[fileName];
  } catch (error) {
    console.error(`Failed to load prompt ${fileName}:`, error.message);
    return null;
  }
};

const buildBuilderUserContent = (resumeText, jobInput, infoObj) => {
  let content = `<job_description>${jobInput}</job_description>`;
  if (infoObj) content += `\n\n<background_information>${JSON.stringify(infoObj)}</background_information>`;
  if (resumeText) content += `\n\n<default_resume>${resumeText}</default_resume>`;
  return content;
};

export const buildInfoObj = async () => ({
  summary: process.env.SUMMARY,
  jobArray: buildJobArray(),
  education: buildEducationArray(),
  certifications: buildCertificationArray(),
  general: process.env.GENERAL_INFO,
});

const buildJobArray = () => {
  const jobs = [];
  for (let jobId = 1; jobId <= 7; jobId++) {
    const bullets = [];
    const accomplishments = [];
    for (let index = 1; index <= 5; index++) {
      const bullet = process.env[`BULLETS_${jobId}_${index}`];
      if (bullet) bullets.push(bullet);
    }
    for (let index = 1; index <= 4; index++) {
      const accomplishment = process.env[`ACCOMPLISHMENTS_${jobId}_${index}`];
      if (accomplishment) accomplishments.push(accomplishment);
    }
    const job = { jobId, company: process.env[`COMPANY_${jobId}`], role: process.env[`ROLE_${jobId}`], timeframe: process.env[`TIMEFRAME_${jobId}`], bullets };
    if (accomplishments.length) job.accomplishments = accomplishments;
    jobs.push(job);
  }
  return jobs;
};

const buildEducationArray = () => {
  const education = [];
  for (let index = 1; index <= 2; index++) {
    education.push({ school: process.env[`SCHOOL_${index}`], program: process.env[`SCHOOL_PROGRAM_${index}`], degree1: process.env[`DEGREE_${index}_1`], degree2: process.env[`DEGREE_${index}_2`], degree3: process.env[`DEGREE_${index}_3`], timeframe: process.env[`SCHOOL_TIMEFRAME_${index}`], graduation: process.env[`GRADUATION_${index}`], notes: process.env[`SCHOOL_NOTES_${index}`] });
  }
  return education;
};

const buildCertificationArray = () => {
  const certifications = [];
  for (let index = 1; index <= 4; index++) {
    const certification = process.env[`CERTIFICATION_${index}`];
    if (!certification) continue;
    certifications.push({ certification, dateCertified: process.env[`DATE_CERTIFIED_${index}`], program: process.env[`CERT_PROGRAM_${index}`], company: process.env[`CERT_COMPANY_${index}`], notes: process.env[`CERT_NOTES_${index}`] });
  }
  return certifications;
};

export const buildSchema = async (aiType, mode, isScreener = false) => {
  if (!aiType || !mode) return null;
  const baseSchema = mode === "prebuilt" ? buildBaseSchemaPrebuilt() : buildBaseSchemaUpload();
  const schema = isScreener ? buildScreenerSchema(baseSchema) : baseSchema;
  if (aiType === "chatgpt") return { name: "resume_enhancement", schema: makeStrictSchema(schema) };
  if (aiType === "claude") return { name: "resume_enhancement", schema: removeUnsupportedClaudeConstraints(makeStrictSchema(schema)) };
  return { type: "json_schema", json_schema: { name: "resume_enhancement", schema } };
};

export const buildBaseSchemaPrebuilt = () => ({
  type: "object",
  required: ["summary", "experience", "skills", "certifications"],
  properties: {
    summary: { type: "string", description: "Tailored professional summary" },
    experience: {
      type: "array",
      description: "Selected jobs keyed by source jobId",
      items: {
        type: "object",
        required: ["jobId", "bullets"],
        properties: {
          jobId: { type: "integer", description: "jobId from background_information.jobArray" },
          bullets: { type: "array", items: { type: "string" }, description: "Tailored accomplishment bullets" },
        },
      },
    },
    skills: {
      type: "array",
      description: "Categorized skills tailored to the job description",
      items: {
        type: "object",
        required: ["category", "items"],
        properties: {
          category: { type: "string" },
          items: { type: "array", items: { type: "string" } },
        },
      },
    },
    certifications: { type: "array", description: "Selected certification display names", items: { type: "string" } },
  },
});

export const buildBaseSchemaUpload = () => ({
  type: "object",
  required: ["name", "email", "summary", "experience", "education", "skills"],
  properties: {
    name: { type: "string", description: "Candidate's full name" },
    email: { type: "string", description: "Candidate's email address" },
    summary: { type: "string", description: "Tailored professional summary" },
    experience: { type: "array", minItems: 7, maxItems: 7, items: { type: "object", required: ["role", "company", "timeframe", "bullets"], properties: { role: { type: "string" }, company: { type: "string" }, timeframe: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
    education: { type: "array", items: { type: "object", required: ["degree", "school", "timeframe"], properties: { degree: { type: "string" }, school: { type: "string" }, timeframe: { type: "string" } } } },
    skills: { type: "array", description: "Categorized skills tailored to the job description", items: { type: "object", required: ["category", "items"], properties: { category: { type: "string" }, items: { type: "array", items: { type: "string" } } } } },
  },
});

const buildScreenerSchema = (baseSchema) => ({
  ...baseSchema,
  required: ["audit", ...baseSchema.required],
  properties: {
    audit: { type: "string", description: "Terse screening audit and corrections made" },
    ...baseSchema.properties,
  },
});

const makeStrictSchema = (schema) => {
  if (schema.type === "array") return { ...schema, items: makeStrictSchema(schema.items) };
  if (schema.type !== "object") return schema;
  const properties = {};
  for (const key of Object.keys(schema.properties ?? {})) properties[key] = makeStrictSchema(schema.properties[key]);
  return { ...schema, properties, required: Object.keys(properties), additionalProperties: false };
};

const removeUnsupportedClaudeConstraints = (schema) => {
  if (schema.type === "array") {
    const { minItems, maxItems, ...supportedSchema } = schema;
    return { ...supportedSchema, items: removeUnsupportedClaudeConstraints(schema.items) };
  }
  if (schema.type !== "object") return schema;
  const properties = {};
  for (const key of Object.keys(schema.properties ?? {})) properties[key] = removeUnsupportedClaudeConstraints(schema.properties[key]);
  const { minItems, maxItems, ...supportedSchema } = schema;
  return { ...supportedSchema, properties };
};
