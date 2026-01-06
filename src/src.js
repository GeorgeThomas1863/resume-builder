import { extractResumeText, buildNewResume } from "./resume.js";
import { buildMessageInput, buildSchema, runSendToAI } from "./ai.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath, formatType, aiType, jobInput } = inputParams;

  const resumeText = await extractResumeText(inputPath, formatType);
  const messageInput = await buildMessageInput(resumeText, aiType, jobInput);
  const schema = await buildSchema();

  console.log("INPUT PARAMS");
  console.log(inputParams);

  if (formatType === "none") return await runDefaultAI(inputParams);

  const aiText = await runSendToAI(aiType, messageInput, schema);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  const buffer = await buildNewResume(aiText, inputParams);

  return buffer;
};
