import { DocArticle, h2, p, ul, ol, note, warn, limit, img, diagram, table } from "../types";

export const resumes: DocArticle[] = [
  {
    slug: "resume-management",
    group: "resumes",
    overview: true,
    title: "Resume management",
    description: "Upload and manage the resumes Applivo uses.",
    blocks: [
      p("The Resumes page lists your baseline PDF resumes and the LaTeX template used when Applivo generates tailored versions."),
      img("Resume management dashboard and baseline resumes", "docs-resume-management.png"),
      h2("Limits"),
      ul(
        "Only PDF files are accepted.",
        "Maximum file size is 10 MB.",
        "You can keep up to 3 active resumes. At the limit, the upload button is disabled and reads Limit Reached.",
      ),
    ],
    related: ["upload-resume", "latex-templates"],
  },
  {
    slug: "upload-resume",
    group: "resumes",
    title: "Uploading a resume",
    description: "Add a baseline PDF.",
    blocks: [
      ol("Open Resumes and choose Upload Baseline.", "Pick a PDF under 10 MB.", "Confirm the upload."),
      img("Baseline PDF resume upload modal", "docs-resume-upload.png"),
      p("Delete a resume you no longer need to free a slot if you are at the limit of 3."),
      warn("Non-PDF files are rejected."),
    ],
    related: ["resume-troubleshooting"],
  },
  {
    slug: "latex-templates",
    group: "resumes",
    title: "LaTeX resume templates",
    description: "Tailored resumes from templates, with Overleaf export.",
    blocks: [
      p("Applivo can compile tailored resumes from LaTeX templates and offers an Overleaf export. Choose a template on the Resumes page; the change applies to future generated resumes."),
      img("LaTeX resume template selector and Overleaf export", "docs-latex-templates.png"),
      note("The project README lists 7 templates. The set you see in the app is loaded from the server."),
    ],
    related: ["resume-management"],
  },
  {
    slug: "resume-troubleshooting",
    group: "resumes",
    title: "Resume troubleshooting",
    description: "Upload and generation problems.",
    blocks: [
      table(
        ["Problem", "Cause"],
        ["Upload rejected", "The file is not a PDF, or it is larger than 10 MB."],
        ["Upload button disabled", "You already have 3 resumes."],
      ),
      img("Resume troubleshooting and upload error state", "docs-resume-troubleshooting.png"),
    ],
    related: ["upload-resume"],
  },
];

export const ai: DocArticle[] = [
  {
    slug: "ai-overview",
    group: "ai",
    overview: true,
    title: "AI features overview",
    description: "What the AI features do and which plan includes each.",
    blocks: [
      table(
        ["Feature", "Plan"],
        ["AI Chat (50 / 100 / 150 messages per month)", "Starter / Pro / Premium"],
        ["Cover letters", "Pro, Premium"],
        ["Interview tracking and preparation", "Pro, Premium"],
        ["Skill gap analysis", "Pro, Premium"],
        ["Follow-up automation", "Pro, Premium"],
        ["Market insights and salary data", "Premium"],
      ),
      diagram("AI features and intelligence engine workflow", "docs-ai-features-workflow.png", "21 / 9"),
      note("AI output can be wrong. Review it before you rely on it or send it."),
    ],
    related: ["ai-chat"],
  },
  {
    slug: "ai-chat",
    group: "ai",
    title: "AI Chat",
    description: "Ask questions about your job search.",
    blocks: [
      p("AI Chat is an assistant inside the app. Open it from AI Chat in the sidebar, or the Ask AI button in the header."),
      ul(
        "Use it for questions about your search, resume or applications.",
        "Monthly message limits depend on your plan: 50 on Starter, 100 on Pro, 150 on Premium.",
      ),
      img("AI Career Assistant chat interface", "docs-ai-chat.png"),
      p("When the limit is reached, chat stops until the next period or until you upgrade."),
    ],
    related: ["plans-overview"],
  },
  {
    slug: "cover-letters",
    group: "ai",
    title: "Cover letters",
    description: "Generate and review cover letters (Pro and Premium).",
    blocks: [
      p("The Cover Letters page generates a letter for a job using your profile and resume. Read and edit the result before using it."),
      img("Tailored cover letter generator", "docs-cover-letter-workflow.png"),
      note("Locked on Starter. The sidebar sends you to Subscription."),
    ],
    related: ["ai-overview"],
  },
  {
    slug: "interview-preparation",
    group: "ai",
    title: "Interview preparation",
    description: "Track interviews and prepare (Pro and Premium).",
    blocks: [
      p("The Interviews page tracks interviews and supports preparation. Interview-related application statuses appear here and on the Applications page."),
      img("Interview Q&A prep and role tracking", "docs-interview-preparation.png"),
    ],
    related: ["application-statuses"],
  },
  {
    slug: "skill-gaps",
    group: "ai",
    title: "Skill gap analysis",
    description: "See skills to build (Pro and Premium).",
    blocks: [
      p("Skill Gaps compares what listings ask for with what your resume shows, and suggests skills to develop. Treat recommendations as guidance rather than requirements."),
      img("Skill gap analysis and recommendation radar", "docs-skill-gaps.png"),
    ],
    related: ["job-match-scores"],
  },
  {
    slug: "market-insights",
    group: "ai",
    title: "Market insights",
    description: "Market and salary data (Premium).",
    blocks: [
      p("Market Insights is a Premium page with market and salary information. The sidebar shows it locked on other plans."),
      img("Market insights and salary benchmarks", "docs-market-insights.png"),
      limit("The data source and refresh schedule are not documented in the code reviewed for this guide."),
    ],
    related: ["plans-overview"],
  },
  {
    slug: "follow-ups",
    group: "ai",
    title: "Follow-ups",
    description: "Reminders after you apply (Pro and Premium).",
    blocks: [
      p("Follow-ups tracks reminders for applications. The plan lists 7-day follow-up automation for Pro and Premium."),
      img("Automated 7-day follow-up reminder schedule", "docs-follow-up-schedule.png"),
      p("Each application has a follow-up state: none, scheduled, sent or responded."),
    ],
    related: ["managing-applications"],
  },
];
