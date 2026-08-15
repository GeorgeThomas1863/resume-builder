# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important: You are the orchestrator. subagents execute. you should NOT build, verify, or code inline (if possible). your job is to plan, prioritize & coordinate the acitons of your subagents

Keep your replies extremely concise and focus on providing necessary information.

Put all pictures / screenshots you take with the mcp plugin in the "pics" subfolder, under the .claude folder in THIS project.

Do NOT commit anything to GitHub. The user will control all commits to GitHub. Do NOT edit or in any way change the user's Git history or interact with GitHub.

# resume-builder

Personal resume optimization tool. Accepts uploaded resume (DOCX/PDF), extracts text, sends to AI with a job description, and saves a tailored resume DOCX to a save folder on the server.

## Commands

```bash
npm start        # Dev server with nodemon (hot-reload)
# No build step, no test suite, no linter configured
```

## Stack

- **Runtime:** Node.js (ES Modules — `"type": "module"` in package.json)
- **Server:** Express 5.x
- **Frontend:** Vanilla ES6 modules, no bundler
- **AI:** OpenAI, Anthropic, and local model providers
- **Docs:** `mammoth` (DOCX parse), `pdf-parse` (PDF parse), `docx` (DOCX generation)
- **Auth:** express-session + password from env, rate-limited (10 attempts/15 min/IP)
- **Storage:** Local filesystem at `/data/{sessionId}/` — no database

## Architecture

```
app.js                   # Entry point — Express setup, middleware, session
routes/router.js         # All route definitions
controllers/
  auth-control.js        # Site auth + admin auth with rate limiting
  data-control.js        # Upload, submit (main flow), delete
  display-control.js     # Serve HTML files
middleware/
  auth-config.js         # requireAuth / requireAdminAuth guards
  session-config.js      # express-session config
  upload-error.js        # Multer error handler
src/
  src.js                 # Orchestrator: runResumeUnfucker() — chains all steps
  ai.js                  # AI clients plus builder-to-screener orchestration
  message.js             # Prompt construction + JSON schema builders
  resume.js              # Text extraction + DOCX paragraph builder
  save-resume.js         # DOCX metadata stamping, filename building, lock-safe save
  upload-file.js         # Multer config, file ops, session-scoped storage
prompts/                 # Builder and screener prompts for prebuilt and upload modes
public/
  js/                    # Frontend ES6 modules (main.js, run.js, auth.js, util/, display/)
  css/                   # Styles
html/                    # Served HTML (index, auth, error pages, admin-auth)
data/                    # Session-scoped uploaded files (gitignored)
```

## Key Data Flow

```
POST /upload  →  multer → /data/{sessionId}/resume.ext
POST /submit  →  submitRouteController
                 → runResumeUnfucker()
                   → extractResumeText()     [mammoth / pdf-parse]
                   → buildMessageInput()     [builder prompt + schema]
                   → runTwoPassAI()          [builder then screener; draft fallback]
                   → buildNewResume()        [docx Packer → Buffer]
                   → returns { buffer, targetCompany, targetTitle, lastName }
                 → applyDocxMetadata()       [stamp created/modified/TotalTime]
                 → buildResumeFileName()     [{Company}_{first 3 title words}_Resume_{LastName}_{MonYYYY}.docx]
                 → writeResumeFile()         [mkdir -p save dir; wx write, _1/_2/... on collision or lock]
                 → res.json({ success: true, fileName, filePath })
GET /default-save-dir → { path }             [RESUME_SAVE_DIR or <root>/resumes]
```

The screener receives the complete builder user input plus the builder draft, may use a separately selected provider/model, and falls back to the valid builder draft on any screener failure. The AI schema (both modes) includes `targetCompany`/`targetTitle`, extracted from the job description, used only for the saved filename.

## Auth

- Two tiers: site auth (`PW`) and admin auth (`ADMIN_PW`)
- Middleware: `requireAuth`, `requireAdminAuth` in `middleware/auth-config.js`
- Admin-only features: `useSpecialInfo` (generate resume without upload), `pi` param

## Environment Variables

```
PORT
SESSION_SECRET
PW                     # Site password
ADMIN_PW               # Admin password
NODE_ENV               # Set to "production" for secure cookies

OPENAI_API_KEY
OPENAI_API_BASE_URL
LOCAL_API_KEY
LOCAL_API_BASE_URL

RESUME_SAVE_DIR         # Default save folder; falls back to <project root>/resumes
INJECT_DOC_DEFAULT_PATH # Optional .docx whose docProps/core.xml + app.xml seed generated resume metadata
```

## Prebuilt Resume Config

Prebuilt-mode content (name/email, summary, jobs with bullets + context, education, certifications, general info, hidden `adminText` watermark) lives in `config/resume-details.json` (gitignored — contains PII). It is loaded once at import by `src/resume.js` (`resumeDetails`); a missing file logs an error and degrades to empty content rather than crashing. `buildInfoObj()` in `src/message.js` assembles it into the AI's `background_information` (jobs get `jobId` = array index + 1). Same schema as the job-search-automation project's config.

## Gotchas

- **Two-pass AI pipeline** — both upload and prebuilt modes run builder then screener; screener failures return the builder draft
- **Experience schema differs by mode** — upload requires seven entries; prebuilt entries are keyed by `jobId`
- **One file per session** — new upload deletes previous file; multiple files in `/data/{sessionId}/` causes an error
- **Hardcoded DOCX styles** — 12pt Times New Roman, specific tab stops; change in `resume.js`
- **Session expiry doesn't clean `/data/`** — orphaned files accumulate; no auto-cleanup
- **Rate limiting is in-memory** — resets on server restart; applies only to auth routes
- **Frontend is pure ES modules** — no bundler; browser must support ES6 imports natively
- **Filename never skips a build** — a colliding or locked (`EBUSY`/`EPERM`/`EACCES`) target name advances to `_1`, `_2`, … up to 20 attempts, then throws
- **DOCX metadata is jittered** — `created` is a random 10–29 minutes before `modified`; `TotalTime` defaults to that same offset unless overridden, then is clamped to the created→modified gap
