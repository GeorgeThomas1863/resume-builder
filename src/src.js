import { extractResumeText, buildNewResume } from "./resume.js";
import { buildMessageInput, buildSchema, runSendToAI } from "./ai.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath, inputType, jobInput } = inputParams;

  // console.log("RESUME UNFUCKER INPUT PARAMS");
  // console.log(inputParams);

  const resumeText = await extractResumeText(inputPath, inputType);
  const messageInput = await buildMessageInput(resumeText, jobInput);
  const schema = await buildSchema();

  const aiParams = {
    ...inputParams,
    messageInput: messageInput,
    schema: schema,
  };

  const aiText = await runSendToAI(aiParams);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  const buffer = await buildNewResume(aiText, inputParams);

  return buffer;
};
