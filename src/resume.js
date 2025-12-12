import mammoth from "mammoth";
import { Document, Packer, Paragraph } from "docx";

export const extractResumeText = async (filePath) => {
  if (!filePath) return null;

  const data = await mammoth.extractRawText({ path: filePath });
  if (!data) return null;

  return data.value;
};

//add format type later
export const buildNewResume = async (aiText, resumeText, inputParams) => {


  const lineArray = aiText.split("\n");

  console.log("LINE ARRAY");
  console.log(lineArray.length);

  const paragraphArray = [];
  for (let i = 0; i < lineArray.length; i++) {
    const line = lineArray[i];
    paragraphArray.push(
      new Paragraph({
        text: line,
        spacing: { after: 100 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphArray,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  console.log("BUFFER");
  console.log(buffer.length);

  return buffer;
};
