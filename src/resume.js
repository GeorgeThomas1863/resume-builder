import mammoth from "mammoth";
import { Document, Paragraph, Packer, TextRun, AlignmentType, BorderStyle, LineRuleType } from "docx";
import { otherObj } from "../config/input-data.js";

export const extractResumeText = async (inputPath, formatType = "dev") => {
  //TURNED OFF FOR CUSTOM
  if (!inputPath || formatType === "prebuilt") return null;

  const data = await mammoth.extractRawText({ path: inputPath });
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
        after: 0,
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

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
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

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
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

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
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

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
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
          text: "2010-Present",
          bold: true,
          italics: true,
          font: "Times New Roman",
          size: 24,
        }),
      ],
      spacing: { before: 0, after: 0 },
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
        spacing: { before: 0, after: 0 },
      })
    );

    // Bullets - 11pt
    for (let j = 0; j < job.bullets.length; j++) {
      paragraphArray.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: job.bullets[j],
              font: "Times New Roman",
              size: 22,
            }),
          ],
          spacing: { before: 0, after: 0 },
        })
      );
    }

    // Add space between jobs //TURN ON
    // if (i < inputObj.experience.length - 1) {
    //   paragraphArray.push(
    //     new Paragraph({
    //       text: "",
    //       spacing: { before: 0, after: 0 },
    //     })
    //   );
    // }
  }

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
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

  //line
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
        after: 0,
        line: 40, // Added - sets exact line height (240 twips = 12pt)
        lineRule: LineRuleType.EXACT, // Added - use exact line height
      },
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
        }),
      ],

      spacing: { before: 0, after: 0 },
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
        }),
      ],
      spacing: { before: 0, after: 0 },
    })
  );

  // space, //TURN ON
  // paragraphArray.push(
  //   new Paragraph({
  //     text: "",
  //     spacing: { before: 0, after: 0 },
  //   })
  // );

  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: "Certifications: GIAC Red Team Professional (GRTP), GIAC Certified Incident Handler (GCIH), GIAC Cyber Threat Intelligence (GCTI)",
          font: "Times New Roman",
          size: 22,
          bold: true,
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
