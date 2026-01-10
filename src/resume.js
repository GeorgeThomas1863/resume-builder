import mammoth from "mammoth";
import { Document, Paragraph, Packer, TextRun, AlignmentType, BorderStyle, LineRuleType, TabStopType, TabStopPosition } from "docx";
import OBJ from "../config/input-data.js";
import { otherObj } from "../config/input-data.js";

export const extractResumeText = async (inputPath, inputType = "prebuilt") => {
  //TURNED OFF FOR CUSTOM
  if (!inputPath || inputType === "prebuilt") return null;

  const data = await mammoth.extractRawText({ path: inputPath });
  if (!data) return null;

  return data.value;
};

//add format type later
export const buildNewResume = async (aiText, inputParams) => {
  const { name, email } = otherObj;
  const { jobArray } = OBJ;

  const inputObj = JSON.parse(aiText);
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
          text: inputObj.summary,
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
  for (let i = 0; i < inputObj.experience.length; i++) {
    const jobAI = inputObj.experience[i];
    const jobConfig = jobArray[i];

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
          text: `${OBJ.education[1].school}, ${OBJ.education[1].degree}`,
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
          text: `${OBJ.education[0].school}, Bachelor of Arts in Economics and International Relations`,
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: `\t${OBJ.education[0].timeframe}`,
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
      ],
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
