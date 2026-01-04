import { extractResumeText, buildNewResume } from "./resume.js";
import { runCustomAI, runDefaultAI } from "./ai.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { formatType } = inputParams;

  console.log("INPUT PARAMS");
  console.log(inputParams);

  if (formatType === "none") return await runDefaultAI(inputParams);

  const aiText = await runCustomAI(inputParams);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  // const data = await buildNewResume(aiText, resumeText, inputParams);

  // console.log("NEW RESUME DATA");
  // console.log(data);

  // return data;
};
