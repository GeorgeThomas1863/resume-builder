export const buildContactPrompt = async (linkText) => {
  if (!linkText) return null;

  const prompt = `You are a research assistant helping a job applicant identify the right person to contact at a company regarding a specific job posting.

I will provide you with a URL to a job posting. Your task is to conduct online research using search engines and your other tools to find the most relevant person associated with this posting, in the following priority order:

1. **Hiring Manager / Recruiter who posted the job** — The person who directly posted or advertised this specific role on LinkedIn or elsewhere. Return their LinkedIn profile URL and, if available, a direct link to their LinkedIn post advertising this role.

2. **Anyone from the company who shared or promoted this job posting** — If the direct poster can't be identified, find anyone at the company who publicly shared or mentioned this job opening. Return their LinkedIn profile URL and a link to the relevant post if available.

3. **Likely manager or team lead for this role** — If no one is found advertising the position, identify the most likely direct manager or team lead for this position based on job title, seniority, and department. Return their LinkedIn profile URL.

4. **Any relevant team member** — If no manager can be identified, find any LinkedIn user who works at the company in the same team or department relevant to this role. Return their LinkedIn profile URL.

If after exhausting all four options you are still unable to find anyone relevant, return exactly: NOT AVAILABLE

---

For whichever result you find, return your answer in this format:

**Result Tier:** [1 / 2 / 3 / 4 / NOT AVAILABLE]
**Name:** [Full name]
**Title:** [Job title]
**LinkedIn Profile:** [URL]
**Job Post Link:** [URL or "Not found"]
**Notes:** [Brief explanation of how you found this person and your confidence level]

---

Job posting URL: ${linkText}`;

  return prompt;
};

export const buildContactSchema = async () => {
  return {
    type: "json_schema",
    json_schema: {
      schema: {
        type: "object",
        properties: {
          result_tier: {
            type: "string",
            enum: ["1", "2", "3", "4", "NOT_AVAILABLE"],
          },
          name: { type: ["string", "null"] },
          title: { type: ["string", "null"] },
          company: { type: ["string", "null"] },
          linkedin_profile_url: { type: ["string", "null"] },
          job_post_url: { type: ["string", "null"] },
          confidence: {
            type: ["string", "null"],
            enum: ["high", "medium", "low", null],
          },
          notes: { type: ["string", "null"] },
        },
        required: ["result_tier", "name", "title", "company", "linkedin_profile_url", "job_post_url", "confidence", "notes"],
        additionalProperties: false,
      },
    },
  };
};
