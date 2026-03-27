import { extractResumeText, buildNewResume } from "./resume.js";
import { runSendToAI, buildClient } from "./ai.js";
import { buildMessageInput, buildSchema, buildInfoObj } from "./message.js";
import { buildContactPrompt, buildContactSchema } from "./contact.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { inputPath, aiType, jobInput, nukeOhio, pi } = inputParams;

  console.log("RESUME UNFUCKER INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText(inputPath);
  // console.log("RESUME TEXT");
  // console.log(resumeText);

  let infoObj = null;
  if (nukeOhio) infoObj = await buildInfoObj();

  const messageInput = await buildMessageInput(resumeText, jobInput, infoObj);
  // console.log("MESSAGE INPUT");
  // console.log(messageInput);
  const schema = await buildSchema(aiType);
  // console.log("SCHEMA");
  // console.log(schema);

  const aiParams = {
    ...inputParams,
    messageInput: messageInput,
    schema: schema,
  };

  // console.log("AI PARAMS");
  // console.log(aiParams);

  const aiText = await runSendToAI(aiParams);
  console.log("AI TEXT");
  console.log(aiText);
  if (!aiText) return null;

  const buffer = await buildNewResume(aiText, infoObj, pi);

  return buffer;
};

//++++++++++++++++++++++++++++

export const getContactInfo = async (linkText) => {
  if (!linkText) return null;

  console.log("GET CONTACT INFO LINK TEXT");
  console.log(linkText);

  const prompt = await buildContactPrompt(linkText);
  const schema = await buildContactSchema();
  const client = await buildClient("claude");

  const messages = [{ role: "user", content: prompt }];

  const res = await client.chat.completions.create({
    model: "sonar-deep-research",
    messages: messages,
    response_format: schema,
    max_tokens: 10000,
  });

  console.log("PERPLEXITY RESPONSE");
  console.log(res);
  console.log(res.choices[0].message.content);

  return res.choices[0].message.content;
};
