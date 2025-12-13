import { extractResumeText, buildNewResume } from "./resume.js";
import { runAI } from "./ai.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath } = inputParams;

  console.log("INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText(inputPath);
  if (!resumeText) return null;
  console.log("RESUME TEXT");
  console.log(resumeText);

  const aiText = await runAI(resumeText, inputParams);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  // const data = await buildNewResume(aiText, resumeText, inputParams);

  // console.log("NEW RESUME DATA");
  // console.log(data);

  // return data;
};
