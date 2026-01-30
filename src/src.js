import { extractResumeText, buildNewResume } from "./resume.js";
import { runSendToAI } from "./ai.js";
import { buildMessageInput, buildSchema, buildInfoObj } from "./message.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath, aiType, jobInput, nukeOhio } = inputParams;

  console.log("RESUME UNFUCKER INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText(inputPath);
  console.log("RESUME TEXT");
  console.log(resumeText);

  let infoObj = null;
  if (nukeOhio) infoObj = await buildInfoObj();

  const messageInput = await buildMessageInput(resumeText, jobInput, infoObj);
  console.log("MESSAGE INPUT");
  console.log(messageInput);
  const schema = await buildSchema(aiType);
  console.log("SCHEMA");
  console.log(schema);

  const aiParams = {
    ...inputParams,
    messageInput: messageInput,
    schema: schema,
  };

  console.log("AI PARAMS");
  console.log(aiParams);

  const aiText = await runSendToAI(aiParams);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  const buffer = await buildNewResume(aiText, infoObj);

  return buffer;
};
