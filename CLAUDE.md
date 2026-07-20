# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important: You are the orchestrator. subagents execute. you should NOT build, verify, or code inline (if possible). your job is to plan, prioritize & coordinate the acitons of your subagents

Keep your replies extremely concise and focus on providing necessary information.

Put all pictures / screenshots you take with the mcp plugin in the "pics" subfolder, under the .claude folder in THIS project.

Do NOT commit anything to GitHub. The user will control all commits to GitHub. Do NOT edit or in any way change the user's Git history or interact with GitHub.

# resume-builder

Personal resume optimization tool. Accepts uploaded resume (DOCX/PDF), extracts text, sends to AI with a job description, and returns a tailored `new-resume.docx`.

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
                 → res.send(buffer) as new-resume.docx attachment
```

The screener receives the complete builder user input plus the builder draft, may use a separately selected provider/model, and falls back to the valid builder draft on any screener failure.

## Auth

- Two tiers: site auth (`PW`) and admin auth (`ADMIN_PW`)
- Middleware: `requireAuth`, `requireAdminAuth` in `middleware/auth-config.js`
- Admin-only features: `nukeOhio` (generate resume without upload), `pi` param

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

# Prebuilt resume mode (admin)
RESUME_NAME, RESUME_EMAIL, SUMMARY, GENERAL_INFO
COMPANY_1-7, ROLE_1-7, TIMEFRAME_1-7
BULLETS_{1-7}_{1-5}, ACCOMPLISHMENTS_{1-7}_{1-4}
SCHOOL_1-2, DEGREE_{1-3}_{1-2}, GRADUATION_1-2
CERTIFICATION_1-4, CERT_PROGRAM_1-4, CERT_COMPANY_1-4
```

## Gotchas

- **Two-pass AI pipeline** — both upload and prebuilt modes run builder then screener; screener failures return the builder draft
- **Experience schema differs by mode** — upload requires seven entries; prebuilt entries are keyed by `jobId`
- **One file per session** — new upload deletes previous file; multiple files in `/data/{sessionId}/` causes an error
- **Hardcoded DOCX styles** — 12pt Times New Roman, specific tab stops; change in `resume.js`
- **Session expiry doesn't clean `/data/`** — orphaned files accumulate; no auto-cleanup
- **Rate limiting is in-memory** — resets on server restart; applies only to auth routes
- **Frontend is pure ES modules** — no bundler; browser must support ES6 imports natively
