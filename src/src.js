import { extractResumeText, buildNewResume, resumeDetails } from "./resume.js";
import { runTwoPassAI } from "./ai.js";
import { buildMessageInput, buildSchema, buildInfoObj } from "./message.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath, aiType, jobInput, useSpecialInfo, pi } = inputParams;

  const resumeText = await extractResumeText(inputPath);
  // console.log("RESUME TEXT");
  // console.log(resumeText);

  let infoObj = null;
  if (useSpecialInfo) infoObj = await buildInfoObj();
  const mode = useSpecialInfo ? "prebuilt" : "upload";

  const messageInput = await buildMessageInput(resumeText, jobInput, infoObj);
  // console.log("MESSAGE INPUT");
  // console.log(messageInput);
  const schema = await buildSchema(aiType, mode, false);
  // console.log("SCHEMA");
  // console.log(schema);

  const aiParams = {
    ...inputParams,
    messageInput: messageInput,
    schema: schema,
  };

  // console.log("AI PARAMS");
  // console.log(aiParams);

  const aiText = await runTwoPassAI({ ...aiParams, mode });
  if (!aiText) return null;

  const aiObj = parseAiResponse(aiText);
  if (!aiObj) return null;

  const buffer = await buildNewResume(aiObj, infoObj, pi);
  if (!buffer) return null;

  const lastName = resolveLastName(mode, aiObj.name);

  return { buffer, targetCompany: aiObj.targetCompany, targetTitle: aiObj.targetTitle, lastName };
};

// the single parse of the AI's JSON response; the parsed object is passed straight into buildNewResume
const parseAiResponse = (aiText) => {
  try {
    const parsed = JSON.parse(aiText);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e.message);
    return null;
  }
};

const resolveLastName = (mode, aiName) => {
  if (mode === "prebuilt") return resumeDetails.lastName || "User";

  const trimmed = typeof aiName === "string" ? aiName.trim() : "";
  if (!trimmed) return "User";

  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1];
};
