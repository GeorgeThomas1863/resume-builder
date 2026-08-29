import fsPromises from "fs/promises";
import { readFileSync } from "fs";
import path from "path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { Document, Paragraph, Packer, TextRun, AlignmentType, BorderStyle, LineRuleType, TabStopType, TabStopPosition } from "docx";

const loadResumeDetails = () => {
  try {
    return JSON.parse(readFileSync(new URL("../config/resume-details.json", import.meta.url), "utf-8"));
  } catch (e) {
    console.error("[resume] failed to load resume-details.json:", e.message);
    return {};
  }
};

export const resumeDetails = loadResumeDetails();

export const extractResumeText = async (inputPath) => {
  //TURNED OFF FOR CUSTOM
  if (!inputPath) return null;

  const extension = path.extname(inputPath).toLowerCase();
  if (extension === ".pdf") return await extractTextPDF(inputPath);
  if (extension !== ".docx") return null;

  try {
    const data = await mammoth.extractRawText({ path: inputPath });
    if (!data) return null;

    return data.value;
  } catch (e) {
    console.error(`Error extracting text from DOCX ${inputPath}:`, e);
    return null;
  }
};

export const extractTextPDF = async (inputPath) => {
  // console.log("EXTRACTING TEXT FROM PDF");
  // console.log("INPUT PATH");
  // console.log(inputPath);

  try {
    const buffer = await fsPromises.readFile(inputPath);
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);

    const data = await parser.getText();
    // console.log("DATA");
    // console.log(data);
    await parser.destroy();
    if (!data) return null;

    return data.text;
  } catch (e) {
    console.error(`Error extracting text from PDF ${inputPath}:`, e);
    return null;
  }
};

//++++++++++++++++++++++++++++++

//MAIN FUNCTION
export const buildNewResume = async (aiObj, infoObj = null, pi = false, verbose = false) => {
  if (!aiObj || typeof aiObj !== "object") return null;

  // console.log("AI OBJ");
  // console.log(aiObj);

  try {
    const paragraphArray = await buildParagraphArray(aiObj, infoObj, pi, verbose);

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
  } catch (e) {
    console.error("Failed to build resume document:", e);
    return null;
  }
};

export const buildParagraphArray = async (aiObj, infoObj = null, pi = false, verbose = false) => {
  if (infoObj && verbose) return await buildVerbosePrebuiltParagraphArray(aiObj, infoObj, pi);
  if (infoObj) return await buildPrebuiltParagraphArray(aiObj, infoObj, pi);
  if (verbose) return await buildVerboseDefaultParagraphArray(aiObj);

  //default
  return await buildDefaultParagraphArray(aiObj);
};

//for me
export const buildPrebuiltParagraphArray = async (aiObj, infoObj, pi = false) => {
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
          text: `${resumeDetails.firstName ?? ""} ${resumeDetails.lastName ?? ""}`.trim(),
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
        after: 240,
      },
      children: [
        new TextRun({
          text: `Email: ${resumeDetails.email ?? ""}`,
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
        after: 120,
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

  //skills section
  if (Array.isArray(aiObj.skills) && aiObj.skills.length > 0) {
    //line skills top
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
          before: 240,
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
            text: "Skills",
            font: "Times New Roman",
            size: 22,
            bold: true,
          }),
        ],
      })
    );

    //line skills bottom
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

    for (const skill of aiObj.skills) {
      paragraphArray.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: `${skill.category}: `,
              font: "Times New Roman",
              size: 22,
              bold: true,
            }),
            new TextRun({
              text: Array.isArray(skill.items) ? skill.items.join(", ") : "",
              font: "Times New Roman",
              size: 22,
              bold: false,
            }),
          ],
        })
      );
    }
  }

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
        before: 280,
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
        after: 120,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  //job loop
  if (!Array.isArray(aiObj.experience)) {
    console.error("AI response missing or invalid 'experience' field (prebuilt mode)");
    return paragraphArray;
  }
  // jobArray order is chronological, so jobId order must never depend on the AI's output order
  const experience = [...aiObj.experience].sort((a, b) => (Number(a?.jobId) || 0) - (Number(b?.jobId) || 0));
  for (let i = 0; i < experience.length; i++) {
    const jobAI = experience[i];
    if (!jobAI || !Array.isArray(jobAI.bullets) || jobAI.bullets.length === 0) {
      console.warn(`Prebuilt experience entry skipped — no bullets: jobId=${jobAI?.jobId}`);
      continue;
    }
    let jobConfig = null;
    for (let jobIndex = 0; jobIndex < infoObj.jobArray.length; jobIndex++) {
      if (infoObj.jobArray[jobIndex].jobId === jobAI.jobId) jobConfig = infoObj.jobArray[jobIndex];
    }
    if (!jobConfig) {
      console.warn(`Prebuilt experience entry skipped — no jobArray match for jobId=${JSON.stringify(jobAI.jobId)}`);
      continue;
    }

    paragraphArray.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${jobConfig.role}, ${jobConfig.company}`,
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
        spacing: { before: 160, after: 40 },
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
        before: 280,
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

  for (let index = infoObj.education.length - 1; index >= 0; index--) {
    const education = infoObj.education[index];
    if (!education?.school) continue;
    const degreeParts = Array.isArray(education.degrees) ? education.degrees : [];
    const degrees = [];
    for (let degreeIndex = 0; degreeIndex < degreeParts.length; degreeIndex++) {
      if (degreeParts[degreeIndex]) degrees.push(degreeParts[degreeIndex]);
    }
    paragraphArray.push(new Paragraph({
      children: [
        new TextRun({ text: degrees.length ? `${education.school}, ${degrees.join(", ")}` : education.school, bold: true, font: "Times New Roman", size: 22 }),
        new TextRun({ text: `\t${education.graduation || education.timeframe || ""}`, bold: true, italics: true, font: "Times New Roman", size: 22 }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
      spacing: { before: index === infoObj.education.length - 1 ? 0 : 160, after: 0 },
    }));
  }

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
          text: buildPrebuiltCertifications(aiObj, infoObj),
          font: "Times New Roman",
          size: 22,
          bold: false,
        }),
        new TextRun({
          text: pi ? ` ${resumeDetails.adminText ?? ""}` : "",
          font: "Times New Roman",
          size: 1,
          color: "FFFFFF", // White text
        }),
      ],
    })
  );

  return paragraphArray;
};

const buildPrebuiltCertifications = (aiObj, infoObj) => {
  if (Array.isArray(aiObj.certifications) && aiObj.certifications.length > 0) return aiObj.certifications.join(", ");
  const certifications = [];
  for (let index = 0; index < infoObj.certifications.length; index++) {
    const certification = infoObj.certifications[index]?.certification;
    if (certification) certifications.push(certification);
  }
  return certifications.join(", ");
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//default
export const buildDefaultParagraphArray = async (aiObj) => {
  const { name, email, summary, experience, education } = aiObj;
  // const { jobArray } = OBJ;

  // console.log("BUIILDING DEFAULT PARAGRAPH ARRAY")
  // console.log("AI OBJ");
  // console.log(aiObj);

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
        after: 240,
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
        after: 120,
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

  //skills section
  if (Array.isArray(aiObj.skills) && aiObj.skills.length > 0) {
    //line skills top
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
          before: 280,
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
            text: "Skills",
            font: "Times New Roman",
            size: 22,
            bold: true,
          }),
        ],
      })
    );

    //line skills bottom
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

    for (const skill of aiObj.skills) {
      paragraphArray.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: `${skill.category}: `,
              font: "Times New Roman",
              size: 22,
              bold: true,
            }),
            new TextRun({
              text: Array.isArray(skill.items) ? skill.items.join(", ") : "",
              font: "Times New Roman",
              size: 22,
              bold: false,
            }),
          ],
        })
      );
    }
  }

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
        before: 280,
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
        after: 120,
        line: 20,
        lineRule: LineRuleType.EXACT,
      },
    })
  );

  //job loop
  if (!Array.isArray(experience)) {
    console.error("AI response missing or invalid 'experience' field");
    return paragraphArray;
  }
  for (let i = 0; i < experience.length; i++) {
    const jobAI = experience[i];
    if (!jobAI || !jobAI.role || !jobAI.timeframe || !jobAI.bullets) {
      console.warn(`Upload experience entry ${i + 1} skipped — missing role, timeframe, or bullets`);
      continue;
    }
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
          ...(jobAI.company
            ? [
                new TextRun({
                  text: `, ${jobAI.company}`,
                  font: "Times New Roman",
                  size: 22,
                }),
              ]
            : []),
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
        before: 280,
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

  if (Array.isArray(education) && education.length >= 1) {
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
  }

  if (Array.isArray(education) && education.length >= 2) {
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
  }

  return paragraphArray;
};

//---
// Verbose renderers — new code below this divider. Classic renderers above are
// untouched; nothing here is called unless verbose=true.

//for me — verbose prebuilt, ported from the job-finder renderer
export const buildVerbosePrebuiltParagraphArray = async (aiObj, infoObj, pi = false) => {
  const paragraphArray = [];
  const renderableJobs = selectRenderableJobs(aiObj, infoObj);
  pushVerboseHeaderParagraphs(paragraphArray);
  pushSummaryParagraphs(paragraphArray, aiObj);
  pushSkillsParagraphs(paragraphArray, aiObj);
  pushVerboseExperienceParagraphs(paragraphArray, renderableJobs);
  pushVerboseEducationParagraphs(paragraphArray, infoObj);
  pushCertificationParagraphs(paragraphArray, aiObj, infoObj, pi);
  logContentStats(aiObj, renderableJobs);
  return paragraphArray;
};

// ─── Verbose prebuilt section builders (document order) ──────────────────────

// Name, then "Email: <address>" — nothing else ever goes in the header
const pushVerboseHeaderParagraphs = (paragraphArray) => {
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [buildRun(`${resumeDetails.firstName ?? ""} ${resumeDetails.lastName ?? ""}`.trim(), { bold: true, size: 32 })],
    })
  );
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [buildRun(`Email: ${resumeDetails.email ?? ""}`)],
    })
  );
};

const pushSummaryParagraphs = (paragraphArray, aiObj) => {
  pushSectionHeading(paragraphArray, "Summary", 0, 100);
  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [buildRun(aiObj.summary)],
    })
  );
};

// spaceBefore differs between the two classic renderers (240 prebuilt, 280 upload);
// the default matches the pasted job-finder spec verbatim
const pushSkillsParagraphs = (paragraphArray, aiObj, spaceBefore = 240) => {
  if (!Array.isArray(aiObj.skills) || aiObj.skills.length === 0) return;
  pushSectionHeading(paragraphArray, "Skills", spaceBefore, 100);
  for (const skill of aiObj.skills) {
    paragraphArray.push(
      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [
          buildRun(`${skill.category}: `, { bold: true }),
          buildRun(Array.isArray(skill.items) ? skill.items.join(", ") : "", { bold: false }),
        ],
      })
    );
  }
};

// AI experience entries paired with their config job, sorted by jobId. Entries
// with no config match or no bullets are dropped here — once — so the document
// and the content stats agree on exactly what was rendered
const selectRenderableJobs = (aiObj, infoObj) => {
  if (!Array.isArray(aiObj.experience)) {
    console.error("AI response missing or invalid 'experience' field (prebuilt mode)");
    return [];
  }
  const experience = [...aiObj.experience].sort((a, b) => (Number(a?.jobId) || 0) - (Number(b?.jobId) || 0));
  const renderable = [];
  for (const jobAI of experience) {
    let jobConfig = null;
    for (const candidate of infoObj.jobArray) {
      if (candidate.jobId === jobAI.jobId) jobConfig = candidate;
    }
    if (!jobConfig) {
      console.warn(`Resume: no jobArray entry found for jobId ${jobAI.jobId}, skipping`);
      continue;
    }
    if (!Array.isArray(jobAI.bullets) || !jobAI.bullets.length) continue;
    renderable.push({ jobAI, jobConfig });
  }
  return renderable;
};

const pushVerboseExperienceParagraphs = (paragraphArray, renderableJobs) => {
  pushSectionHeading(paragraphArray, "Professional Experience", 280, 120);
  for (const { jobAI, jobConfig } of renderableJobs) {
    pushVerbosePrebuiltJobParagraphs(paragraphArray, jobAI, jobConfig);
  }
};

const pushVerbosePrebuiltJobParagraphs = (paragraphArray, jobAI, jobConfig) => {
  paragraphArray.push(
    buildDatedLine([buildRun(jobConfig.role, { bold: true }), buildRun(`, ${jobConfig.company}`)], jobConfig.timeframe, { before: 180, after: 40 })
  );

  pushScopeParagraph(paragraphArray, jobAI.scope);

  for (const bullet of jobAI.bullets) {
    paragraphArray.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [buildRun(bullet)],
        spacing: { before: 20, after: 0 },
      })
    );
  }
};

// italic scope line, shared by both verbose renderers; empty/whitespace scope renders nothing
const pushScopeParagraph = (paragraphArray, scope) => {
  const trimmed = typeof scope === "string" ? scope.trim() : "";
  if (!trimmed) return;
  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 40 },
      children: [buildRun(trimmed, { italics: true })],
    })
  );
};

// Most recent degree first; notes on a line under each entry
const pushVerboseEducationParagraphs = (paragraphArray, infoObj) => {
  pushSectionHeading(paragraphArray, "Education", 280, 120);
  const entries = sortEducationNewestFirst(infoObj.education);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    paragraphArray.push(
      buildDatedLine([buildRun(formatEducationTitle(entry), { bold: true })], entry.graduation ?? entry.timeframe ?? "", { before: i === 0 ? 0 : 160, after: 0 })
    );
    if (entry.notes) {
      paragraphArray.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [buildRun(entry.notes)],
        })
      );
    }
  }
};

// All credentials on one comma-joined line, no dates, rendered as a full section
// (unlike the classic inline "Certifications: " label — that difference is intentional).
// The hidden adminText run rides on it when pi is set
const pushCertificationParagraphs = (paragraphArray, aiObj, infoObj, pi) => {
  const certs = resolveCertifications(aiObj, infoObj);
  if (certs.length === 0) return;
  pushSectionHeading(paragraphArray, "Certifications", 280, 120);
  const trailing = pi ? [buildRun(` ${resumeDetails.adminText ?? ""}`, { size: 1, color: "FFFFFF" })] : [];
  paragraphArray.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [buildRun(certs.join(", ")), ...trailing],
    })
  );
};

// ─── Shared verbose section helpers ───────────────────────────────────────────

const FONT = "Times New Roman";
const BODY_SIZE = 22; // half-points = 11pt
const RIGHT_TAB = [{ type: TabStopType.RIGHT, position: 10800 }];

const buildRun = (text, opts = {}) => new TextRun({ text, font: FONT, size: BODY_SIZE, ...opts });

const buildRule = (spacing) =>
  new Paragraph({
    border: { bottom: { color: "000000", space: 0, style: BorderStyle.SINGLE, size: 1 } },
    spacing: { ...spacing, line: 20, lineRule: LineRuleType.EXACT },
  });

// rule / bold title / rule — the section chrome used throughout the verbose documents
const pushSectionHeading = (paragraphArray, title, spaceBefore, spaceAfter) => {
  paragraphArray.push(buildRule({ before: spaceBefore, after: 40 }));
  paragraphArray.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [buildRun(title, { bold: true })] }));
  paragraphArray.push(buildRule({ before: 40, after: spaceAfter }));
};

// Left-aligned runs with a bold-italic date flush right; trailingRuns land after the date
const buildDatedLine = (leftRuns, date, spacing, trailingRuns = []) =>
  new Paragraph({
    children: [...leftRuns, buildRun(`\t${date ?? ""}`, { bold: true, italics: true }), ...trailingRuns],
    tabStops: RIGHT_TAB,
    spacing,
  });

const sortEducationNewestFirst = (education) => {
  const entries = Array.isArray(education) ? [...education] : [];
  entries.sort((a, b) => extractYear(b.graduation ?? b.timeframe) - extractYear(a.graduation ?? a.timeframe));
  return entries;
};

// Last 4-digit number in a date string — "2006-2010" → 2010, "May 2019" → 2019
const extractYear = (value) => {
  const matches = String(value ?? "").match(/\d{4}/g);
  return matches ? Number(matches[matches.length - 1]) : 0;
};

const formatEducationTitle = (entry) => {
  const degrees = Array.isArray(entry.degrees) ? entry.degrees.filter(Boolean) : [];
  if (degrees.length === 0) return entry.school ?? "";
  return `${entry.school ?? ""}, ${degrees.join("; ")}`;
};

// AI-selected credentials (objects or legacy strings) are kept only when they
// match a config entry by name; the printed name is always taken from config so
// the model can never print an invented credential. Dates are never printed.
// Duplicates are dropped; if nothing usable was selected the full config list is printed
const resolveCertifications = (aiObj, infoObj) => {
  const configCerts = Array.isArray(infoObj.certifications) ? infoObj.certifications : [];
  const selected = Array.isArray(aiObj.certifications) ? aiObj.certifications : [];
  const resolved = [];
  const seen = new Set();
  for (const item of selected) {
    const name = typeof item === "string" ? item : item?.name;
    if (!name) continue;
    const fromConfig = findConfigCertification(configCerts, name);
    if (!fromConfig) {
      console.warn(`Resume: AI selected certification "${name}" not found in config, dropping`);
      continue;
    }
    if (seen.has(fromConfig.certification)) continue;
    seen.add(fromConfig.certification);
    resolved.push(fromConfig.certification);
  }
  if (resolved.length > 0) return resolved;
  for (const cert of configCerts) {
    if (cert.certification) resolved.push(cert.certification);
  }
  return resolved;
};

const findConfigCertification = (configCerts, name) => {
  const wanted = normalizeCertName(name);
  for (const cert of configCerts) {
    if (normalizeCertName(cert.certification) === wanted) return cert;
  }
  return null;
};

const normalizeCertName = (value) => String(value ?? "").trim().toLowerCase();

// Word/bullet counts so the two-page floor is observable in the build logs —
// computed from the jobs that actually rendered, not the raw AI payload
const logContentStats = (aiObj, renderableJobs) => {
  const chunks = [aiObj.summary];
  if (typeof aiObj.headline === "string") chunks.push(aiObj.headline); // never rendered, still counted
  let bullets = 0;
  for (const { jobAI } of renderableJobs) {
    chunks.push(jobAI.scope);
    for (const bullet of jobAI.bullets) {
      bullets++;
      chunks.push(bullet);
    }
  }
  for (const skill of Array.isArray(aiObj.skills) ? aiObj.skills : []) {
    chunks.push(skill.category);
    if (Array.isArray(skill.items)) chunks.push(skill.items.join(" "));
  }
  const words = countWords(chunks.join(" "));
  const jobs = renderableJobs.length;
  console.log(`[resume] content: ${words} words | ${bullets} bullets | ${jobs} jobs`);
  return { words, bullets, jobs };
};

const countWords = (text) => String(text ?? "").split(/\s+/).filter(Boolean).length;

// ─── Verbose upload orchestrator ──────────────────────────────────────────────
// Current upload layout plus an italic scope line under each job's header line.
// Reuses the shared verbose helpers above; does not copy the classic function.

export const buildVerboseDefaultParagraphArray = async (aiObj) => {
  const { name, email, experience, education } = aiObj;
  const paragraphArray = [];
  pushVerboseDefaultHeaderParagraphs(paragraphArray, name, email);
  pushSummaryParagraphs(paragraphArray, aiObj);
  pushSkillsParagraphs(paragraphArray, aiObj, 280);
  const hasValidExperience = pushVerboseDefaultExperienceParagraphs(paragraphArray, experience);
  if (!hasValidExperience) return paragraphArray;
  pushVerboseDefaultEducationParagraphs(paragraphArray, education);
  return paragraphArray;
};

const pushVerboseDefaultHeaderParagraphs = (paragraphArray, name, email) => {
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [buildRun(name, { bold: true, size: 32 })],
    })
  );
  paragraphArray.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [buildRun(`Email: ${email}`)],
    })
  );
};

// Returns false (and leaves Education off the document) when experience is invalid,
// mirroring the classic upload renderer's early return
const pushVerboseDefaultExperienceParagraphs = (paragraphArray, experience) => {
  pushSectionHeading(paragraphArray, "Professional Experience", 280, 120);
  if (!Array.isArray(experience)) {
    console.error("AI response missing or invalid 'experience' field");
    return false;
  }
  for (let i = 0; i < experience.length; i++) {
    const jobAI = experience[i];
    if (!jobAI || !jobAI.role || !jobAI.timeframe || !jobAI.bullets) {
      console.warn(`Upload experience entry ${i + 1} skipped — missing role, timeframe, or bullets`);
      continue;
    }
    pushVerboseDefaultJobParagraphs(paragraphArray, jobAI);
  }
  return true;
};

const pushVerboseDefaultJobParagraphs = (paragraphArray, jobAI) => {
  paragraphArray.push(
    new Paragraph({
      // the leading indent run is bare (no font/size) in the classic renderer — matched exactly here
      children: [
        new TextRun({ text: " " }),
        buildRun(`- ${jobAI.role}`, { bold: true }),
        ...(jobAI.company ? [buildRun(`, ${jobAI.company}`)] : []),
        buildRun(`\t${jobAI.timeframe}`, { bold: true, italics: true }),
      ],
      tabStops: RIGHT_TAB,
      spacing: { before: 160, after: 0 },
    })
  );

  pushScopeParagraph(paragraphArray, jobAI.scope);

  for (const bullet of jobAI.bullets) {
    paragraphArray.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [buildRun(bullet)],
        spacing: { before: 20, after: 0 },
      })
    );
  }
};

const pushVerboseDefaultEducationParagraphs = (paragraphArray, education) => {
  pushSectionHeading(paragraphArray, "Education", 280, 120);
  if (!Array.isArray(education)) return;
  if (education.length >= 1) {
    paragraphArray.push(
      buildDatedLine([buildRun(`${education[0].school}, ${education[0].degree}`, { bold: true })], education[0].timeframe, { before: 0, after: 0 })
    );
  }
  if (education.length >= 2) {
    paragraphArray.push(
      buildDatedLine([buildRun(`${education[1].school}, ${education[1].degree}`, { bold: true })], education[1].timeframe, { before: 160, after: 0 })
    );
  }
};
