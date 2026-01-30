import fsPromises from "fs/promises";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { Document, Paragraph, Packer, TextRun, AlignmentType, BorderStyle, LineRuleType, TabStopType, TabStopPosition } from "docx";
// import OBJ from "../config/input-data.js";
// import { otherObj } from "../config/input-data.js";

export const extractResumeText = async (inputPath, nukeOhio = null) => {
  //TURNED OFF FOR CUSTOM
  if (!inputPath || !nukeOhio) return null;

  if (inputPath.endsWith(".pdf")) return await extractTextPDF(inputPath);

  const data = await mammoth.extractRawText({ path: inputPath });
  if (!data) return null;

  return data.value;
};

export const extractTextPDF = async (inputPath) => {
  console.log("EXTRACTING TEXT FROM PDF");
  console.log("INPUT PATH");
  console.log(inputPath);

  try {
    const buffer = await fsPromises.readFile(inputPath);
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);

    const data = await parser.getText();
    console.log("DATA");
    console.log(data);
    await parser.destroy();
    if (!data) return null;

    return data.text;
  } catch (e) {
    console.log("ERROR EXTRACTING TEXT FROM PDF");
    console.log(e);
    return null;
  }
};

//++++++++++++++++++++++++++++++

//MAIN FUNCTION
export const buildNewResume = async (aiText, infoObj = null) => {
  // console.log("AI TEXT");
  // console.log(aiText);
  // console.log("INFO OBJ");
  // console.log(infoObj);
  // console.log("INPUT PARAMS");
  // console.log(inputParams);

  const aiObj = JSON.parse(aiText);

  console.log("AI OBJ");
  console.log(aiObj);

  const paragraphArray = await buildParagraphArray(aiObj, infoObj);

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

export const buildParagraphArray = async (aiObj, infoObj = null) => {
  if (infoObj) return await buildPrebuiltParagraphArray(aiObj, infoObj);

  //default
  return await buildDefaultParagraphArray(aiObj);
};

//for me
export const buildPrebuiltParagraphArray = async (aiObj, infoObj) => {
  const paragraphArray = [];

  console.log("ALLAHU AKBAR")

  //name header
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: process.env.RESUME_NAME,
          font: "Times New Roman",
          bold: true,
          size: 32, // 32 half-points = 16pt
        }),
      ],
    })
  );

  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 160, //8pt
      },
      children: [
        new TextRun({
          text: `Email: ${process.env.RESUME_EMAIL}`,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  //line, summary top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 0,
        after: 40,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: "Summary",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line summary bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 100,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  //summary content
  paragraphArray.push(
    new Paragraph({
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: aiObj.summary,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  //line professional experience top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 120,
        after: 40,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Professional Experience",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line professional experience bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 0,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
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
          text: `\t2010-Present`,
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 24,
        }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 10800,
        },
      ],
      spacing: { before: 120, after: 160 },
    })
  );

  //job loop
  for (let i = 0; i < aiObj.experience.length; i++) {
    const jobAI = aiObj.experience[i];
    const jobConfig = infoObj.jobArray[i];

    paragraphArray.push(
      new Paragraph({
        children: [
          new TextRun({
            // text: " ".repeat(2),
            text: " ", //1 space indent
          }),
          new TextRun({
            text: `- ${jobConfig.role}`,
            bold: true,
            font: "Times New Roman",
            size: 22, // 22 half-points = 11pt
          }),
          new TextRun({
            text: `\t${jobConfig.timeframe}`,
            bold: true,
            italics: true,
            font: "Times New Roman",
            size: 22,
          }),
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            // position: TabStopPosition.MAX,
            position: 10800,
            // position: 10400,
          },
        ],
        spacing: { before: 160, after: 0 },
      })
    );

    // Bullets - 11pt
    for (let j = 0; j < jobAI.bullets.length; j++) {
      paragraphArray.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: jobAI.bullets[j],
              font: "Times New Roman",
              size: 22,
            }),
          ],
          spacing: { before: 20, after: 0 },
        })
      );
    }
  }

  //line education top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 160,
        after: 40,
        line: 20, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Education",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line education bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 120,
        line: 20, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          // text: "Georgetown University, Master of Arts in Security Studies",
          text: `${infoObj.education[1].school}, ${infoObj.education[1].degree1}`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: `\tMay 2019`,
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 10800,
        },
      ],
      spacing: { before: 0, after: 0 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          // text: "Catholic University of America, Bachelor of Arts in International Relations; Economics; History",
          text: `${infoObj.education[0].school}, Bachelor of Arts in Economics and International Relations`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: `\t${infoObj.education[0].timeframe}`,
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 10800,
        },
      ],
      spacing: { before: 160, after: 0 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 160, after: 0 },
      children: [
        new TextRun({
          text: "Certifications: ",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
        new TextRun({
          text: "GIAC Red Team Professional (GRTP), GIAC Certified Incident Handler (GCIH), GIAC Cyber Threat Intelligence (GCTI)",
          font: "Times New Roman",
          size: 22,
          bold: false,
        }),
        new TextRun({
          text: ` ${process.env.ADMIN_TEXT}`,
          font: "Times New Roman",
          size: 1,
          color: "FFFFFF", // White text
        }),
      ],
    })
  );

  return paragraphArray;
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//default
export const buildDefaultParagraphArray = async (aiObj) => {
  const { name, email, summary, experience, education } = aiObj;
  // const { jobArray } = OBJ;

  const paragraphArray = [];

  //name header
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: name,
          font: "Times New Roman",
          bold: true,
          size: 32, // 32 half-points = 16pt
        }),
      ],
    })
  );

  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 160, //8pt
      },
      children: [
        new TextRun({
          text: `Email: ${email}`,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  //line, summary top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 0,
        after: 40,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: "Summary",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line summary bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 100,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  //summary content
  paragraphArray.push(
    new Paragraph({
      spacing: {
        before: 0,
        after: 0,
      },
      children: [
        new TextRun({
          text: summary,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  //line professional experience top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 120,
        after: 40,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Professional Experience",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line professional experience bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 0,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  //job loop
  for (let i = 0; i < experience.length; i++) {
    const jobAI = experience[i];
    if (!jobAI || !jobAI.role || !jobAI.timeframe || !jobAI.bullets) continue;
    // const jobConfig = jobArray[i];

    paragraphArray.push(
      new Paragraph({
        children: [
          new TextRun({
            // text: " ".repeat(2),
            text: " ", //1 space indent
          }),
          new TextRun({
            text: `- ${jobAI.role}`,
            bold: true,
            font: "Times New Roman",
            size: 22, // 22 half-points = 11pt
          }),
          new TextRun({
            text: `\t${jobAI.timeframe}`,
            bold: true,
            italics: true,
            font: "Times New Roman",
            size: 22,
          }),
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            // position: TabStopPosition.MAX,
            position: 10800,
            // position: 10400,
          },
        ],
        spacing: { before: 160, after: 0 },
      })
    );

    // Bullets - 11pt
    for (let j = 0; j < jobAI.bullets.length; j++) {
      paragraphArray.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: jobAI.bullets[j],
              font: "Times New Roman",
              size: 22,
            }),
          ],
          spacing: { before: 20, after: 0 },
        })
      );
    }
  }

  //line education top
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 160,
        after: 40,
        line: 20, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Education",
          font: "Times New Roman",
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  //line education bottom
  paragraphArray.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 0,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
      spacing: {
        before: 40,
        after: 120,
        line: 20, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
      },
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          // text: "Georgetown University, Master of Arts in Security Studies",
          text: `${education[0].school}, ${education[0].degree}`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: `\t${education[0].timeframe}`,
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 10800,
        },
      ],
      spacing: { before: 0, after: 0 },
    })
  );

  paragraphArray.push(
    new Paragraph({
      children: [
        new TextRun({
          // text: "Catholic University of America, Bachelor of Arts in International Relations; Economics; History",
          text: `${education[1].school}, ${education[1].degree}`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: `\t${education[1].timeframe}`,
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: 10800,
        },
      ],
      spacing: { before: 160, after: 0 },
    })
  );

  return paragraphArray;
};
