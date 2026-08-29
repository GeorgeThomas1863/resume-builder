import fs from "fs/promises";
import { resumeDetails } from "./resume.js";

const promptCache = {};
const resumeConfigCache = {};

export const buildMessageInput = async (resumeText, jobInput, infoObj = null, verbose = false) => {
  if (!jobInput) return null;
  const mode = infoObj ? "prebuilt" : "upload";
  const prompt = await loadPrompt(`builder-${mode}${verbose ? "-verbose" : ""}.md`);
  if (!prompt) return null;
  const userContent = await buildBuilderUserContent(resumeText, jobInput, infoObj, verbose);
  return [{ role: "system", content: prompt }, { role: "user", content: userContent }];
};

export const buildScreenerMessageInput = async (builderMessages, draftText, mode, verbose = false) => {
  if (!Array.isArray(builderMessages) || !draftText || !mode) return null;
  const prompt = await loadPrompt(`screener-${mode}${verbose ? "-verbose" : ""}.md`);
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

// resume-config1.md / resume-config2.md are gitignored, hand-written reference resumes used
// only for prebuilt verbose mode; absence is expected in some environments and must not block a build
const loadResumeConfig = async (fileName) => {
  if (fileName in resumeConfigCache) return resumeConfigCache[fileName];
  try {
    resumeConfigCache[fileName] = await fs.readFile(new URL(`../config/${fileName}`, import.meta.url), "utf8");
  } catch (error) {
    console.warn(`Resume config ${fileName} not available:`, error.message);
    resumeConfigCache[fileName] = null;
  }
  return resumeConfigCache[fileName];
};

const buildResumeReferenceBlock = async () => {
  const [v1, v2] = await Promise.all([loadResumeConfig("resume-config1.md"), loadResumeConfig("resume-config2.md")]);
  let block = "";
  if (v1) block += `\n\n<resume_v1>${v1}</resume_v1>`;
  if (v2) block += `\n\n<resume_v2>${v2}</resume_v2>`;
  return block;
};

const buildBuilderUserContent = async (resumeText, jobInput, infoObj, verbose) => {
  let content = `<job_description>${jobInput}</job_description>`;
  if (infoObj) content += `\n\n<background_information>${JSON.stringify(infoObj)}</background_information>`;
  if (infoObj && verbose) content += await buildResumeReferenceBlock();
  if (resumeText) content += `\n\n<default_resume>${resumeText}</default_resume>`;
  return content;
};

export const buildInfoObj = async () => ({
  summary: resumeDetails.summary,
  jobArray: buildJobArray(),
  education: resumeDetails.education ?? [],
  certifications: resumeDetails.certifications ?? [],
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

export const buildSchema = async (aiType, mode, isScreener = false, verbose = false) => {
  if (!aiType || !mode) return null;
  const baseSchema = mode === "prebuilt" ? buildBaseSchemaPrebuilt(verbose) : buildBaseSchemaUpload(verbose);
  const schema = isScreener ? buildScreenerSchema(baseSchema) : baseSchema;
  if (aiType === "chatgpt") return { name: "resume_enhancement", schema: makeStrictSchema(schema) };
  if (aiType === "claude") return { name: "resume_enhancement", schema: removeUnsupportedClaudeConstraints(makeStrictSchema(schema)) };
  return { type: "json_schema", json_schema: { name: "resume_enhancement", schema } };
};

// verbose=false must stay byte-identical to the pre-verbose shape (existing tests enforce
// this) — every verbose-only addition goes through a conditional spread, never a direct field
export const buildBaseSchemaPrebuilt = (verbose = false) => ({
  type: "object",
  required: [...(verbose ? ["headline"] : []), "summary", "experience", "skills", "certifications", "targetCompany", "targetTitle"],
  properties: {
    ...(verbose ? { headline: { type: "string", description: "3–8 word headline mirroring the target job title" } } : {}),
    summary: { type: "string", description: "Tailored professional summary" },
    experience: {
      type: "array",
      description: "Selected jobs keyed by source jobId",
      items: {
        type: "object",
        required: [...(verbose ? ["scope"] : []), "jobId", "bullets"],
        properties: {
          jobId: { type: "integer", description: "jobId from background_information.jobArray" },
          ...(verbose ? { scope: { type: "string", description: "One-sentence role scope line; empty string when not determinable" } } : {}),
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
    targetCompany: { type: "string", description: "Hiring company name extracted from job_description; use \"Company\" if not determinable" },
    targetTitle: { type: "string", description: "Job title extracted from job_description; use \"Role\" if not determinable" },
  },
});

export const buildBaseSchemaUpload = (verbose = false) => ({
  type: "object",
  required: [...(verbose ? ["headline"] : []), "name", "email", "summary", "experience", "education", "skills", "targetCompany", "targetTitle"],
  properties: {
    ...(verbose ? { headline: { type: "string", description: "3–8 word headline mirroring the target job title" } } : {}),
    name: { type: "string", description: "Candidate's full name" },
    email: { type: "string", description: "Candidate's email address" },
    summary: { type: "string", description: "Tailored professional summary" },
    experience: { type: "array", minItems: 7, maxItems: 7, items: { type: "object", required: [...(verbose ? ["scope"] : []), "role", "company", "timeframe", "bullets"], properties: { role: { type: "string" }, company: { type: "string" }, timeframe: { type: "string" }, ...(verbose ? { scope: { type: "string", description: "One-sentence role scope line; empty string when not determinable" } } : {}), bullets: { type: "array", items: { type: "string" } } } } },
    education: { type: "array", items: { type: "object", required: ["degree", "school", "timeframe"], properties: { degree: { type: "string" }, school: { type: "string" }, timeframe: { type: "string" } } } },
    skills: { type: "array", description: "Categorized skills tailored to the job description", items: { type: "object", required: ["category", "items"], properties: { category: { type: "string" }, items: { type: "array", items: { type: "string" } } } } },
    targetCompany: { type: "string", description: "Hiring company name extracted from job_description; use \"Company\" if not determinable" },
    targetTitle: { type: "string", description: "Job title extracted from job_description; use \"Role\" if not determinable" },
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
