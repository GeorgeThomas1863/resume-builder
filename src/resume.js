import mammoth from "mammoth";
import { Document, Paragraph, Packer, TextRun, AlignmentType, BorderStyle } from "docx";
import { otherObj } from "../config/input-data.js";

export const extractResumeText = async (filePath) => {
  if (!filePath) return null;

  const data = await mammoth.extractRawText({ path: filePath });
  if (!data) return null;

  return data.value;
};

//add format type later
export const buildNewResume = async (aiText, inputParams) => {
  const { name, email } = otherObj;

  const inputObj = JSON.parse(aiText);
  const paragraphArray = [];

  //name header
  paragraphArray.push(
    new Paragraph({
      text: name,
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      style: {
        font: { name: "Times New Roman", size: 32 },
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: email,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      style: {
        font: { name: "Times New Roman", size: 22 }, // 22 half-points = 11pt
      },
    })
  );

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: "Summary",
      bold: true,
      spacing: { after: 0 },
      style: {
        font: { name: "Times New Roman", size: 22 },
      },
    })
  );

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  //summary content
  paragraphArray.push(
    new Paragraph({
      text: inputObj.summary,
      spacing: { after: 200 },
      style: {
        font: { name: "Times New Roman", size: 22 },
      },
    })
  );

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: "Professional Experience",
      bold: true,
      spacing: { after: 0 },
      style: {
        font: { name: "Times New Roman", size: 22 },
      },
    })
  );

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  //job header
  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Intelligence Analyst, Federal Bureau of Investigation",
          bold: true,
          font: "Times New Roman",
          size: 24,
        }),
        new TextRun({
          text: "2010-Present",
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 24,
          spacing: { after: 100 },
        }),
      ],
    })
  );

  //job loop
  for (let i = 0; i < inputObj.experience.length; i++) {
    const job = inputObj.experience[i];

    paragraphArray.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `- ${job.role}, ${job.company}, `,
            bold: true,
            font: "Times New Roman",
            size: 22, // 22 half-points = 11pt
          }),
          new TextRun({
            text: job.timeframe,
            bold: true,
            italics: true,
            font: "Times New Roman",
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    // Bullets - 11pt
    for (let j = 0; j < job.bullets.length; j++) {
      paragraphArray.push(
        new Paragraph({
          text: job.bullets[j],
          bullet: { level: 0 },
          spacing: { after: 100 },
          style: {
            font: { name: "Times New Roman", size: 22 },
          },
        })
      );
    }

    // Add space between jobs
    if (i < inputObj.experience.length - 1) {
      paragraphArray.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
        })
      );
    }
  }

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: "Education",
      bold: true,
      spacing: { after: 0 },
      style: {
        font: { name: "Times New Roman", size: 22 },
      },
    })
  );

  //line
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 200 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Georgetown University, Master of Arts in Security Studies",
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: "May 2019",
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
          spacing: { after: 100 },
        }),
      ],
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Catholic University of America, Bachelor of Arts in International Relations; Economics; History",
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: "May 2010",
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
          spacing: { after: 100 },
        }),
      ],
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: "",
      spacing: { after: 200 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      text: "Certifications: GIAC Red Team Professional (GRTP), GIAC Certified Incident Handler (GCIH), GIAC Cyber Threat Intelligence (GCTI)",
      bold: true,
      spacing: { after: 0 },
      style: {
        font: { name: "Times New Roman", size: 22 },
      },
    })
  );

  //build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 720 twips = 0.5 inches
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: paragraphArray,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

// const lineArray = aiText.split("\n");

// console.log("LINE ARRAY");
// console.log(lineArray.length);

// const paragraphArray = [];
// for (let i = 0; i < lineArray.length; i++) {
//   const line = lineArray[i];
//   paragraphArray.push(
//     new Paragraph({
//       text: line,
//       spacing: { after: 100 },
//     })
//   );
// }

// const doc = new Document({
//   sections: [
//     {
//       children: paragraphArray,
//     },
//   ],
// });

// const buffer = await Packer.toBuffer(doc);
// console.log("BUFFER");
// console.log(buffer.length);

// return buffer;
