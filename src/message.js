import fs from "fs/promises";
import { resumeDetails } from "./resume.js";

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
  summary: resumeDetails.summary,
  jobArray: buildJobArray(),
  education: resumeDetails.education ?? [],
  general: resumeDetails.general ?? [],
});

const buildJobArray = () => {
  const jobs = [];
  const source = Array.isArray(resumeDetails.jobs) ? resumeDetails.jobs : [];
  for (let index = 0; index < source.length; index++) {
    const job = { jobId: index + 1, ...source[index] };
    if (!job.context) delete job.context;
    jobs.push(job);
  }
  return jobs;
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
  required: ["company_name", "summary", "experience", "skills"],
  properties: {
    company_name: { type: "string", description: "Hiring company named in the job description, or 'Unknown'" },
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
  },
});

export const buildBaseSchemaUpload = () => ({
  type: "object",
  required: ["company_name", "name", "email", "summary", "experience", "education", "skills"],
  properties: {
    company_name: { type: "string", description: "Hiring company named in the job description, or 'Unknown'" },
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
