import { extractResumeText, buildNewResume } from "./resume.js";
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



  const buffer = await buildNewResume(aiText, infoObj, pi);

  return buffer;
};
