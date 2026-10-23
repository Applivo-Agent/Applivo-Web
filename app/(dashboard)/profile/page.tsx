"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, onboardingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Code,
  Edit3,
  Plus,
  X,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
  Award,
  Layers,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { UNIVERSAL_SKILLS } from "@/lib/skillRecommendations";
import { ApplivoLoader } from "@/components/applivo-loader";

// --- Custom Brand Icons (LinkedIn & GitHub) ---
function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
    </svg>
  );
}

function GitHubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// --- Interfaces ---
interface WorkExpItem {
  title: string;
  company: string;
  start_date?: string;
  start?: string;
  end_date?: string | null;
  end?: string | null;
  is_current?: boolean;
  description?: string;
  bullets?: string[];
  location?: string;
}

interface EducationItem {
  degree: string;
  field?: string;
  institution: string;
  year?: string | number;
  graduation_year?: string | number;
  gpa?: string | number;
  description?: string;
}

interface SkillItem {
  id: string;
  name: string;
  category?: string;
  proficiency?: string;
  years_experience?: number;
  is_primary?: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Queries
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get().then((r) => r.data),
    staleTime: 60000,
  });

  const { data: profileSkills = [] } = useQuery<SkillItem[]>({
    queryKey: ["profile-skills"],
    queryFn: () => profileApi.listSkills().then((r) => r.data),
    staleTime: 60000,
  });

  // Modal / Editing States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [modalType, setModalType] = useState<"experience" | "education" | "skill" | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    experience_level: "ENTRY",
    desired_roles: [] as string[],
    desired_roles_input: "",
    professional_summary: "",
    career_goals: "",
    unique_value_proposition: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  // Experience Form State
  const [expForm, setExpForm] = useState({
    title: "",
    company: "",
    start_month: "01",
    start_year: "",
    end_month: "01",
    end_year: "",
    is_current: false,
    description: "",
  });

  // Education Form State
  const [eduForm, setEduForm] = useState({
    degree: "",
    field: "",
    institution: "",
    graduation_year: "",
    gpa: "",
  });

  // Skill Form State
  const [skillForm, setSkillForm] = useState({
    name: "",
    proficiency: "intermediate",
    category: "tool",
  });

  // Helpers
  const formatExperienceLevel = (value?: string | null) => {
    if (!value) return "Not specified";
    const clean = value.replace(/_/g, " ").toLowerCase();
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "AP";
  };

  const formatMonthYear = (value?: string | null) => {
    if (!value) return "Not specified";
    const raw = String(value).trim();
    if (!raw) return "Not specified";
    const yyyymm = raw.match(/^(\d{4})-(\d{2})$/);
    if (yyyymm) {
      const [_, year, month] = yyyymm;
      const dt = new Date(Number(year), Number(month) - 1, 1);
      if (!Number.isNaN(dt.getTime())) {
        return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    }
    const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) return yearMatch[0];
    return raw;
  };

  const toYearOnly = (value?: string | number | null) => {
    if (!value) return "";
    const raw = String(value).trim();
    const match = raw.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : "";
  };

  // Profile Completeness Calculation
  const calculateCompleteness = () => {
    let score = 0;
    const checks = [
      { key: "name", weight: 10, complete: Boolean(profile?.full_name || user?.full_name) },
      { key: "email", weight: 10, complete: Boolean(user?.email) },
      { key: "phone", weight: 10, complete: Boolean(profile?.phone?.trim()) },
      { key: "location", weight: 10, complete: Boolean(profile?.location?.trim()) },
      { key: "experience_level", weight: 10, complete: Boolean(profile?.experience_level) },
      { key: "summary", weight: 15, complete: Boolean(profile?.professional_summary?.trim()) },
      { key: "work", weight: 15, complete: Boolean(profile?.work_experience?.length > 0) },
      { key: "education", weight: 10, complete: Boolean(profile?.education?.length > 0) },
      { key: "skills", weight: 10, complete: Boolean(profileSkills?.length > 0) },
    ];

    checks.forEach((c) => {
      if (c.complete) score += c.weight;
    });

    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Actionable Suggestions based on real missing profile data
  const getSuggestions = () => {
    const list: {
      id: string;
      label: string;
      desc: string;
      actionText: string;
      onClick: () => void;
    }[] = [];

    if (!profile?.professional_summary?.trim()) {
      list.push({
        id: "summary",
        label: "Add professional summary",
        desc: "Tailors AI-generated outreach and cover letters",
        actionText: "+ Add",
        onClick: () => handleOpenEditProfile(),
      });
    }

    if (!profile?.work_experience || profile.work_experience.length === 0) {
      list.push({
        id: "experience",
        label: "Add work experience",
        desc: "Highlight past roles for automated application questionnaires",
        actionText: "+ Add",
        onClick: () => {
          setExpForm({
            title: "",
            company: "",
            start_month: "01",
            start_year: "",
            end_month: "01",
            end_year: "",
            is_current: false,
            description: "",
          });
          setEditIndex(null);
          setModalType("experience");
        },
      });
    }

    if (!profileSkills || profileSkills.length < 3) {
      list.push({
        id: "skills",
        label: "Add key skills",
        desc: "Boost matching accuracy against top job requirements",
        actionText: "+ Add",
        onClick: () => {
          setSkillForm({ name: "", proficiency: "intermediate", category: "tool" });
          setModalType("skill");
        },
      });
    }

    if (!profile?.phone?.trim()) {
      list.push({
        id: "phone",
        label: "Add contact phone number",
        desc: "Required by hiring portals for application callbacks",
        actionText: "+ Add",
        onClick: () => handleOpenEditProfile(),
      });
    }

    if (!profile?.education || profile.education.length === 0) {
      list.push({
        id: "education",
        label: "Add education background",
        desc: "Increases verification for engineering and graduate roles",
        actionText: "+ Add",
        onClick: () => {
          setEduForm({
            degree: "",
            field: "",
            institution: "",
            graduation_year: "",
            gpa: "",
          });
          setEditIndex(null);
          setModalType("education");
        },
      });
    }

    return list.slice(0, 3);
  };

  const suggestions = getSuggestions();

  // Mutations
  const mutUpdate = useMutation({
    mutationFn: (data: any) => profileApi.update(data),
    onSuccess: () => {
      toast.success("Profile saved successfully");
      setIsEditProfileOpen(false);
      setModalType(null);
      setEditIndex(null);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["profile-skills"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Failed to update profile";
      toast.error(typeof msg === "string" ? msg : "Update failed");
    },
  });

  const mutAddSkill = useMutation({
    mutationFn: (data: any) => profileApi.addSkill(data),
    onSuccess: () => {
      toast.success("Skill added");
      setSkillForm({ name: "", proficiency: "intermediate", category: "tool" });
      qc.invalidateQueries({ queryKey: ["profile-skills"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Failed to add skill";
      toast.error(typeof msg === "string" ? msg : "Failed to add skill");
    },
  });

  const mutDeleteSkill = useMutation({
    mutationFn: (skillId: string) => profileApi.deleteSkill(skillId),
    onSuccess: () => {
      toast.success("Skill removed");
      qc.invalidateQueries({ queryKey: ["profile-skills"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to remove skill"),
  });

  const mutParseAndFill = useMutation({
    mutationFn: async (file: File) => {
      setResumeError(null);
      const fd = new FormData();
      fd.append("file", file);
      return onboardingApi.parseResumeAndFill(fd);
    },
    onSuccess: () => {
      toast.success("Profile updated from resume!");
      setResumeFile(null);
      setResumeError(null);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["profile-skills"] });
    },
    onError: (err: any) => {
      const detail =
        err?.response?.data?.detail ||
        "Failed to parse resume PDF. Please check file formatting.";
      setResumeError(typeof detail === "string" ? detail : "Resume parsing failed");
      toast.error("Resume parsing failed");
    },
  });

  // Handlers
  const handleOpenEditProfile = () => {
    const roles = Array.isArray(profile?.desired_roles) ? profile.desired_roles : [];
    setProfileForm({
      full_name: profile?.full_name || user?.full_name || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      experience_level: (profile?.experience_level || "ENTRY").toUpperCase(),
      desired_roles: roles,
      desired_roles_input: roles.join(", "),
      professional_summary: profile?.professional_summary || "",
      career_goals: profile?.career_goals || "",
      unique_value_proposition: profile?.unique_value_proposition || "",
      linkedin_url: profile?.linkedin_url || "",
      github_url: profile?.github_url || "",
      portfolio_url: profile?.portfolio_url || "",
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    const parsedRoles = profileForm.desired_roles_input
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    mutUpdate.mutate({
      full_name: profileForm.full_name.trim(),
      phone: profileForm.phone.trim(),
      location: profileForm.location.trim(),
      experience_level: profileForm.experience_level,
      desired_roles: parsedRoles,
      professional_summary: profileForm.professional_summary.trim(),
      career_goals: profileForm.career_goals.trim(),
      unique_value_proposition: profileForm.unique_value_proposition.trim(),
      linkedin_url: profileForm.linkedin_url.trim(),
      github_url: profileForm.github_url.trim(),
      portfolio_url: profileForm.portfolio_url.trim(),
    });
  };

  const handleAddExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.title.trim() || !expForm.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }

    const data: WorkExpItem = {
      title: expForm.title.trim(),
      company: expForm.company.trim(),
      start_date: expForm.start_year ? `${expForm.start_year}-${expForm.start_month}` : "",
      end_date: expForm.is_current
        ? null
        : expForm.end_year
        ? `${expForm.end_year}-${expForm.end_month}`
        : null,
      is_current: expForm.is_current,
      description: expForm.description.trim(),
    };

    const currentList: WorkExpItem[] = Array.isArray(profile?.work_experience)
      ? [...profile.work_experience]
      : [];

    if (editIndex !== null && editIndex >= 0 && editIndex < currentList.length) {
      currentList[editIndex] = data;
    } else {
      currentList.unshift(data);
    }

    mutUpdate.mutate({ work_experience: currentList });
  };

  const handleEditExperienceOpen = (index: number) => {
    const list = profile?.work_experience || [];
    const item = list[index];
    if (!item) return;

    const sDate = item.start_date || item.start || "";
    const sParts = sDate.split("-");
    const eDate = item.end_date || item.end || "";
    const eParts = eDate.split("-");

    setExpForm({
      title: item.title || "",
      company: item.company || "",
      start_year: sParts[0] || "",
      start_month: sParts[1] || "01",
      end_year: eParts[0] || "",
      end_month: eParts[1] || "01",
      is_current: Boolean(item.is_current),
      description: item.description || (Array.isArray(item.bullets) ? item.bullets.join("\n") : ""),
    });
    setEditIndex(index);
    setModalType("experience");
  };

  const handleDeleteExperience = (index: number) => {
    if (!window.confirm("Are you sure you want to remove this experience entry?")) return;
    const currentList = Array.isArray(profile?.work_experience)
      ? profile.work_experience.filter((_: any, i: number) => i !== index)
      : [];
    mutUpdate.mutate({ work_experience: currentList });
  };

  const handleAddEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      toast.error("Degree and institution are required");
      return;
    }

    const data: EducationItem = {
      degree: eduForm.degree.trim(),
      field: eduForm.field.trim(),
      institution: eduForm.institution.trim(),
      graduation_year: eduForm.graduation_year ? Number(eduForm.graduation_year) : undefined,
      gpa: eduForm.gpa ? Number(eduForm.gpa) : undefined,
    };

    const currentList: EducationItem[] = Array.isArray(profile?.education)
      ? [...profile.education]
      : [];

    if (editIndex !== null && editIndex >= 0 && editIndex < currentList.length) {
      currentList[editIndex] = data;
    } else {
      currentList.unshift(data);
    }

    mutUpdate.mutate({ education: currentList });
  };

  const handleEditEducationOpen = (index: number) => {
    const list = profile?.education || [];
    const item = list[index];
    if (!item) return;

    setEduForm({
      degree: item.degree || "",
      field: item.field || "",
      institution: item.institution || "",
      graduation_year: toYearOnly(item.year || item.graduation_year),
      gpa: item.gpa ? String(item.gpa) : "",
    });
    setEditIndex(index);
    setModalType("education");
  };

  const handleDeleteEducation = (index: number) => {
    if (!window.confirm("Are you sure you want to remove this education record?")) return;
    const currentList = Array.isArray(profile?.education)
      ? profile.education.filter((_: any, i: number) => i !== index)
      : [];
    mutUpdate.mutate({ education: currentList });
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = skillForm.name.trim();
    if (!name) return;

    const exists = profileSkills.some(
      (s: SkillItem) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.info(`"${name}" is already in your skills`);
      setSkillForm({ name: "", proficiency: "intermediate", category: "tool" });
      return;
    }

    mutAddSkill.mutate({
      name,
      proficiency: skillForm.proficiency,
      category: skillForm.category,
    });
  };

  const handleResumeFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setResumeError("Only PDF files are supported");
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File size exceeds 5MB limit");
      toast.error("File is too large (max 5MB)");
      return;
    }
    setResumeError(null);
    setResumeFile(file);
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast.success("Account ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownloadProfile = () => {
    const candidateName = profile?.full_name || user?.full_name || "Applicant";
    const lines = [
      "==================================================",
      "APPLIVO PROFESSIONAL PROFILE OVERVIEW",
      "==================================================",
      "",
      `Full Name:         ${candidateName}`,
      `Email:             ${user?.email || "—"}`,
      `Phone:             ${profile?.phone || "—"}`,
      `Location:          ${profile?.location || "—"}`,
      `Experience Level:  ${formatExperienceLevel(profile?.experience_level)}`,
      `Account ID:        ${user?.id || "—"}`,
      "",
      "--- PROFESSIONAL SUMMARY ---",
      profile?.professional_summary || "None provided",
      "",
      "--- SOCIAL LINKS ---",
      `LinkedIn:          ${profile?.linkedin_url || "—"}`,
      `GitHub:            ${profile?.github_url || "—"}`,
      `Portfolio:         ${profile?.portfolio_url || "—"}`,
      "",
      "--- WORK EXPERIENCE ---",
      ...(profile?.work_experience?.length
        ? profile.work_experience.map(
            (w: WorkExpItem, i: number) =>
              `${i + 1}. ${w.title} at ${w.company} (${formatMonthYear(
                w.start_date || w.start
              )} - ${w.is_current ? "Present" : formatMonthYear(w.end_date || w.end)})\n   ${
                w.description || (Array.isArray(w.bullets) ? w.bullets.join("; ") : "No description")
              }`
          )
        : ["No work experience listed"]),
      "",
      "--- EDUCATION ---",
      ...(profile?.education?.length
        ? profile.education.map(
            (e: EducationItem, i: number) =>
              `${i + 1}. ${e.degree}${e.field ? " in " + e.field : ""} from ${e.institution} (${
                e.graduation_year || e.year || "Year not specified"
              }${e.gpa ? ", GPA: " + e.gpa : ""})`
          )
        : ["No education listed"]),
      "",
      "--- SKILLS ---",
      profileSkills.length
        ? profileSkills.map((s: SkillItem) => s.name).join(", ")
        : "No skills listed",
      "",
      "==================================================",
      `Exported from Applivo on ${new Date().toLocaleDateString()}`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${candidateName.replace(/\s+/g, "-").toLowerCase()}-profile.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Profile exported to text file");
  };

  if (isLoading) {
    return <ApplivoLoader variant="content" text="Loading Profile" />;
  }

  const candidateName = profile?.full_name || user?.full_name || "New Candidate";
  const initials = getInitials(candidateName, user?.email);

  return (
    <div className="dash-page pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE HEADER (TITLE & PRIMARY ACTIONS)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadProfile}
            className="h-8 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12.5px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
            title="Export Profile as plain text"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12.5px] font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-black" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. IDENTITY CARD (COMPACT LINEAR-STYLE BANNER)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-xl bg-[var(--app-card)] border border-[var(--app-border-strong)] p-5 sm:p-5.5 shadow-sm">
        {/* Subtle monochrome geometric grid backdrop */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.035]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="identity-grid-pattern"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#identity-grid-pattern)" />
          </svg>
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-32 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Identity Content Area */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Avatar & Personal Info */}
          <div className="flex items-center gap-4 sm:gap-4.5">
            {/* Clean Circular Avatar (Initials, Monochrome) */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/10 ring-1 ring-white/5 bg-[#1b1b1e] flex items-center justify-center text-white text-lg sm:text-xl font-semibold tracking-tight shadow-inner select-none">
                {initials}
              </div>
            </div>

            {/* Identity Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] sm:text-[18px] font-semibold text-white tracking-tight">
                  {candidateName}
                </h2>
                {user?.is_superuser && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    Administrator
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/70 border border-zinc-700/40 text-zinc-300">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  <span>{user?.is_verified ? "Verified Member" : "Active Member"}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{user?.email || "No email available"}</span>
                </span>

                <span className="text-zinc-600 hidden sm:inline">•</span>

                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{formatExperienceLevel(profile?.experience_level)}</span>
                </span>

                {profile?.location && (
                  <>
                    <span className="text-zinc-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{profile.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Copyable Applivo ID (Rebalanced, No Profile Strength) */}
          {user?.id && (
            <div className="flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[12px] shrink-0">
              <span className="text-zinc-400 font-medium">Applivo ID:</span>
              <code className="text-zinc-200 font-mono text-[11.5px]">
                {user.id.slice(0, 8)}…
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Copy full account ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. STRUCTURED PROFILE OVERVIEW (RESPONSIVE 2-COLUMN LAYOUT)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================
            LEFT COLUMN (7 COLS): PERSONAL DETAILS, WORK & EDUCATION
            ========================================================= */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* --- A. PERSONAL DETAILS --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  Personal Details
                </h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  Your primary contact and career profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="h-7 px-2.5 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3 h-3 text-zinc-400" />
                <span>Edit</span>
              </button>
            </div>

            {/* Clean row-by-row key/value details */}
            <div className="divide-y divide-[var(--app-border-strong)]/60 text-[13px]">
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Full Name
                </span>
                <span className="text-white font-medium">{candidateName}</span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Email Address
                </span>
                <span className="text-white font-medium">{user?.email || "—"}</span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Phone Number
                </span>
                <span className={cn("font-medium", profile?.phone ? "text-white" : "text-zinc-500 italic")}>
                  {profile?.phone || "Not specified"}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Location
                </span>
                <span className={cn("font-medium", profile?.location ? "text-white" : "text-zinc-500 italic")}>
                  {profile?.location || "Not specified"}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Experience Level
                </span>
                <span className="text-white font-medium capitalize">
                  {formatExperienceLevel(profile?.experience_level)}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0 pt-0.5">
                  Target Roles
                </span>
                <div className="flex-1 flex flex-wrap gap-1.5 justify-start sm:justify-end">
                  {Array.isArray(profile?.desired_roles) && profile.desired_roles.length > 0 ? (
                    profile.desired_roles.map((role: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic text-[12px]">No target roles specified</span>
                  )}
                </div>
              </div>

              <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.01] transition-colors">
                <span className="text-zinc-400 text-[12px] font-medium sm:w-40 shrink-0">
                  Social & Portfolio
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {profile?.linkedin_url ? (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors text-[12px]"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  ) : (
                    <span className="text-zinc-500 text-[12px]">No LinkedIn</span>
                  )}

                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors text-[12px]"
                    >
                      <GitHubIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}

                  {profile?.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors text-[12px]"
                    >
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Portfolio</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              <div className="px-4 sm:px-5 py-3.5 space-y-1.5">
                <span className="text-zinc-400 text-[12px] font-medium block">
                  Professional Summary
                </span>
                <div className="p-3 rounded-lg bg-transparent border border-[var(--app-border-strong)] text-[12.5px] text-zinc-300 leading-relaxed">
                  {profile?.professional_summary?.trim() ? (
                    profile.professional_summary
                  ) : (
                    <p className="text-zinc-500 italic text-[12px]">
                      No summary provided. Add a brief description of your background to personalize AI outreach and auto-applications.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* --- B. WORK EXPERIENCE --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  Work Experience
                </h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  Employment history, internships, and relevant industry roles.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setExpForm({
                    title: "",
                    company: "",
                    start_month: "01",
                    start_year: "",
                    end_month: "01",
                    end_year: "",
                    is_current: false,
                    description: "",
                  });
                  setEditIndex(null);
                  setModalType("experience");
                }}
                className="h-7 px-2.5 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-zinc-400" />
                <span>Add</span>
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {Array.isArray(profile?.work_experience) && profile.work_experience.length > 0 ? (
                <div className="space-y-3">
                  {profile.work_experience.map((exp: WorkExpItem, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] transition-colors hover:border-zinc-700/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                          <Briefcase className="w-4 h-4" />
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="text-[13.5px] font-medium text-white tracking-tight">
                            {exp.title}
                          </h4>
                          <p className="text-[12px] font-medium text-zinc-300">
                            {exp.company}
                          </p>

                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-400 pt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              <span>
                                {formatMonthYear(exp.start_date || exp.start)} —{" "}
                                {exp.is_current
                                  ? "Present"
                                  : formatMonthYear(exp.end_date || exp.end)}
                              </span>
                            </span>
                            {exp.is_current && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                                Current
                              </span>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-[12px] text-zinc-400 pt-1.5 leading-relaxed whitespace-pre-line">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditExperienceOpen(i)}
                          className="h-6.5 w-6.5 rounded bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                          title="Edit this position"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(i)}
                          className="h-6.5 w-6.5 rounded bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-zinc-400 hover:text-red-400 transition-colors flex items-center justify-center"
                          title="Delete experience"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-7 text-center rounded-lg border border-dashed border-[var(--app-border-strong)] bg-white/[0.01]">
                  <Briefcase className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
                  <p className="text-[13px] font-medium text-white">No work experience listed</p>
                  <p className="text-[12px] text-zinc-400 mt-1 max-w-sm mx-auto">
                    Add previous positions, internships, or freelance projects to showcase your career timeline.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setExpForm({
                        title: "",
                        company: "",
                        start_month: "01",
                        start_year: "",
                        end_month: "01",
                        end_year: "",
                        is_current: false,
                        description: "",
                      });
                      setEditIndex(null);
                      setModalType("experience");
                    }}
                    className="mt-3 h-7 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* --- C. EDUCATION & QUALIFICATIONS --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  Education & Qualifications
                </h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  Degrees, institutions, graduation years, and academic standing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEduForm({
                    degree: "",
                    field: "",
                    institution: "",
                    graduation_year: "",
                    gpa: "",
                  });
                  setEditIndex(null);
                  setModalType("education");
                }}
                className="h-7 px-2.5 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-zinc-400" />
                <span>Add</span>
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {Array.isArray(profile?.education) && profile.education.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.education.map((edu: EducationItem, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] transition-colors hover:border-zinc-700/60 relative group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0 text-zinc-400 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5 flex-1 pr-10">
                          <h4 className="text-[13px] font-medium text-white tracking-tight">
                            {edu.field ? `${edu.degree} in ${edu.field}` : edu.degree}
                          </h4>
                          <p className="text-[12px] text-zinc-300">{edu.institution}</p>
                          <div className="flex items-center gap-2.5 text-[11px] text-zinc-400 pt-1.5 font-medium">
                            <span>
                              {edu.graduation_year || edu.year
                                ? `Graduated ${edu.graduation_year || edu.year}`
                                : "Year not specified"}
                            </span>
                            {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditEducationOpen(i)}
                          className="h-6 w-6 rounded bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                          title="Edit education"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(i)}
                          className="h-6 w-6 rounded bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-zinc-400 hover:text-red-400 transition-colors flex items-center justify-center"
                          title="Delete education"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-7 text-center rounded-lg border border-dashed border-[var(--app-border-strong)] bg-white/[0.01]">
                  <GraduationCap className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
                  <p className="text-[13px] font-medium text-white">No education added</p>
                  <p className="text-[12px] text-zinc-400 mt-1 max-w-sm mx-auto">
                    Add your university, college, or bootcamp qualification to verify degree prerequisites.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEduForm({
                        degree: "",
                        field: "",
                        institution: "",
                        graduation_year: "",
                        gpa: "",
                      });
                      setEditIndex(null);
                      setModalType("education");
                    }}
                    className="mt-3 h-7 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Education</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =========================================================
            RIGHT COLUMN (5 COLS): RESUME IMPORT, SKILLS, ACCOUNT
            ========================================================= */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          {/* --- 1. RESUME-BASED PROFILE IMPORT --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)]">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-zinc-400" />
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  Import from Resume
                </h3>
              </div>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Auto-fill your experience, education, and skills directly from your PDF resume.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {/* File drop / select zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(true);
                }}
                onDragLeave={() => setIsDraggingResume(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleResumeFileSelect(file);
                }}
                className={cn(
                  "p-3.5 rounded-lg border border-dashed transition-colors flex flex-col items-center justify-center text-center cursor-pointer",
                  isDraggingResume
                    ? "border-white bg-white/[0.04]"
                    : "border-[var(--app-border-strong)] hover:border-zinc-700 bg-[var(--app-nested)]"
                )}
                onClick={() => document.getElementById("resume-upload-input")?.click()}
              >
                <input
                  id="resume-upload-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={mutParseAndFill.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeFileSelect(file);
                  }}
                />

                <FileText className="w-5 h-5 text-zinc-400 mb-1" />
                {resumeFile ? (
                  <div className="space-y-0.5 flex flex-col items-center">
                    <p className="text-[12px] font-medium text-white truncate max-w-[220px]">
                      {resumeFile.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                          setResumeError(null);
                        }}
                        className="text-[11px] text-zinc-400 hover:text-white underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-medium text-white">Click or drag PDF resume here</p>
                    <p className="text-[11px] text-zinc-400">Max size 5MB • Formats: .PDF</p>
                  </div>
                )}
              </div>

              {resumeError && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-red-950/40 border border-red-800/40 text-red-300 text-[12px]">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{resumeError}</span>
                </div>
              )}

              <button
                type="button"
                disabled={!resumeFile || mutParseAndFill.isPending}
                onClick={() => {
                  if (resumeFile) mutParseAndFill.mutate(resumeFile);
                }}
                className="w-full h-8 rounded-md bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black text-[12px] font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {mutParseAndFill.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Update Profile From Resume</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* --- 2. SKILLS & TECHNOLOGIES --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight">
                  Skills & Technologies
                </h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  {profileSkills.length} skill{profileSkills.length === 1 ? "" : "s"} listed
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSkillForm({ name: "", proficiency: "intermediate", category: "tool" });
                  setModalType("skill");
                }}
                className="h-7 px-2.5 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-zinc-400" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* Quick add inline bar */}
              <form onSubmit={handleAddSkillSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quick add (e.g., Python, Docker)"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="flex-1 h-8 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[12px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!skillForm.name.trim() || mutAddSkill.isPending}
                  className="h-8 px-3 rounded-md bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black text-[12px] font-semibold hover:bg-zinc-200 transition-colors shrink-0"
                >
                  {mutAddSkill.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
                </button>
              </form>

              {/* Skill tags */}
              {profileSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-52 overflow-y-auto no-scrollbar">
                  {profileSkills.map((sk: SkillItem) => (
                    <span
                      key={sk.id}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 hover:text-white transition-colors"
                    >
                      <span>{sk.name}</span>
                      <button
                        type="button"
                        onClick={() => mutDeleteSkill.mutate(sk.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-zinc-500 italic py-1">
                  No skills added yet. Add skills to match roles requiring specific tech stacks.
                </p>
              )}
            </div>
          </section>

          {/* --- 3. ACCOUNT DETAILS --- */}
          <section className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--app-border-strong)]">
              <h3 className="text-[15px] font-semibold text-white tracking-tight">
                Account Details
              </h3>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Authentication and membership metadata
              </p>
            </div>

            <div className="divide-y divide-[var(--app-border-strong)]/60 text-[12px]">
              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Account ID</span>
                <span className="text-white font-mono text-[11px] truncate max-w-[160px]">
                  {user?.id || "—"}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Created Date</span>
                <span className="text-white font-medium">
                  {formatDate(profile?.created_at || (user as any)?.created_at)}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Last Login</span>
                <span className="text-white font-medium">
                  {(user as any)?.last_login_at
                    ? timeAgo((user as any).last_login_at)
                    : "Current session"}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Account Role</span>
                <span className="text-white font-medium">
                  {user?.is_superuser ? "Administrator" : "Candidate"}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Verification</span>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{user?.is_verified ? "Verified" : "Active"}</span>
                </span>
              </div>

              <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 font-medium">Automation Engine</span>
                <span className="text-white font-medium">
                  {profile?.auto_apply_enabled ? "Autonomous Active" : "Standby"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. EDIT PROFILE MODAL (Reference Image 3)
          ───────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          4. EDIT PROFILE MODAL (COMPACT LINEAR-STYLE)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl w-full max-w-[680px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-[16px] font-semibold text-white tracking-tight">
                    Edit Personal Profile
                  </h3>
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    Update your identity, contact information, and professional bio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-[13px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Full Name <span className="text-zinc-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Experience Level
                    </label>
                    <select
                      value={profileForm.experience_level}
                      onChange={(e) => setProfileForm({ ...profileForm, experience_level: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 transition-colors capitalize text-[13px]"
                    >
                      <option value="ENTRY">Entry Level</option>
                      <option value="MID">Mid Level</option>
                      <option value="SENIOR">Senior Level</option>
                      <option value="LEAD">Lead / Staff</option>
                      <option value="EXECUTIVE">Executive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 012-3456"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Location (City, Country)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Target Job Roles (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Software Engineer, Full Stack Developer, ML Engineer"
                      value={profileForm.desired_roles_input}
                      onChange={(e) => setProfileForm({ ...profileForm, desired_roles_input: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Professional Summary
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Experienced engineer with a background in distributed systems, modern web apps..."
                      value={profileForm.professional_summary}
                      onChange={(e) => setProfileForm({ ...profileForm, professional_summary: e.target.value })}
                      className="w-full p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors resize-none leading-relaxed text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileForm.linkedin_url}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileForm.github_url}
                      onChange={(e) => setProfileForm({ ...profileForm, github_url: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11.5px] font-medium text-zinc-300">
                      Portfolio / Personal Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourdomain.com"
                      value={profileForm.portfolio_url}
                      onChange={(e) => setProfileForm({ ...profileForm, portfolio_url: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-[13px]"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border-strong)]">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="h-8 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mutUpdate.isPending}
                    className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {mutUpdate.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          5. EXPERIENCE, EDUCATION & SKILL MODALS (COMPACT LINEAR-STYLE)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden",
                modalType === "experience" ? "max-w-[560px]" : modalType === "education" ? "max-w-[500px]" : "max-w-[460px]"
              )}
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[var(--app-border-strong)] flex items-center justify-between shrink-0">
                <h3 className="text-[15.5px] font-semibold text-white capitalize tracking-tight">
                  {editIndex !== null ? "Edit" : "Add"}{" "}
                  {modalType === "experience"
                    ? "Work Experience"
                    : modalType === "education"
                    ? "Education"
                    : "Skill"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Work Experience Form */}
              {modalType === "experience" && (
                <form onSubmit={handleAddExperienceSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-[13px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Job Title <span className="text-zinc-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={expForm.title}
                        onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Company Name <span className="text-zinc-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Stripe, Acme Corp"
                        value={expForm.company}
                        onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Start Date
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={expForm.start_month}
                          onChange={(e) => setExpForm({ ...expForm, start_month: e.target.value })}
                          className="w-24 shrink-0 h-8.5 px-2 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[12px]"
                        >
                          {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m) => (
                            <option key={m} value={m}>
                              {new Date(2000, parseInt(m) - 1).toLocaleString("en-US", { month: "short" })}
                            </option>
                          ))}
                        </select>
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{4}"
                          maxLength={4}
                          placeholder="2022"
                          value={expForm.start_year}
                          onChange={(e) =>
                            setExpForm({
                              ...expForm,
                              start_year: e.target.value.replace(/\D/g, "").slice(0, 4),
                            })
                          }
                          className="flex-1 h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[13px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        End Date
                      </label>
                      {expForm.is_current ? (
                        <div className="h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-400 flex items-center text-[12px]">
                          Present (Ongoing)
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <select
                            value={expForm.end_month}
                            onChange={(e) => setExpForm({ ...expForm, end_month: e.target.value })}
                            className="w-24 shrink-0 h-8.5 px-2 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[12px]"
                          >
                            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m) => (
                              <option key={m} value={m}>
                                {new Date(2000, parseInt(m) - 1).toLocaleString("en-US", { month: "short" })}
                              </option>
                            ))}
                          </select>
                          <input
                            required={!expForm.is_current}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{4}"
                            maxLength={4}
                            placeholder="2024"
                            value={expForm.end_year}
                            onChange={(e) =>
                              setExpForm({
                                ...expForm,
                                end_year: e.target.value.replace(/\D/g, "").slice(0, 4),
                              })
                            }
                            className="flex-1 h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[13px]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 pt-0.5">
                      <label className="flex items-center gap-2 text-[12px] text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={expForm.is_current}
                          onChange={(e) =>
                            setExpForm({
                              ...expForm,
                              is_current: e.target.checked,
                              end_year: e.target.checked ? "" : expForm.end_year,
                            })
                          }
                          className="rounded bg-zinc-800 border-zinc-700 text-white focus:ring-0"
                        />
                        <span>I currently work in this role</span>
                      </label>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Description & Key Achievements
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Built scalable microservices, led frontend architecture migration..."
                        value={expForm.description}
                        onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                        className="w-full p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none leading-relaxed text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border-strong)]">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="h-8 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mutUpdate.isPending}
                      className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {mutUpdate.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{editIndex !== null ? "Update Experience" : "Add Experience"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Education Form */}
              {modalType === "education" && (
                <form onSubmit={handleAddEducationSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-[13px]">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Degree <span className="text-zinc-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Bachelor of Technology (B.Tech), Master of Science"
                        value={eduForm.degree}
                        onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Field of Study / Major
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science, Information Technology"
                        value={eduForm.field}
                        onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Institution / University <span className="text-zinc-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Stanford University, IIT Delhi"
                        value={eduForm.institution}
                        onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11.5px] font-medium text-zinc-300">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          placeholder="2024"
                          value={eduForm.graduation_year}
                          onChange={(e) => setEduForm({ ...eduForm, graduation_year: e.target.value })}
                          className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[13px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11.5px] font-medium text-zinc-300">
                          GPA / Score
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 3.8 / 4.0 or 8.5"
                          value={eduForm.gpa}
                          onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                          className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none text-[13px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border-strong)]">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="h-8 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mutUpdate.isPending}
                      className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {mutUpdate.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{editIndex !== null ? "Update Education" : "Add Education"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Skill Form */}
              {modalType === "skill" && (
                <form onSubmit={handleAddSkillSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-[13px]">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Skill Name <span className="text-zinc-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. React.js, Python, PostgreSQL"
                        value={skillForm.name}
                        onChange={(e) => {
                          setSkillForm({ ...skillForm, name: e.target.value });
                        }}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none focus:border-zinc-500 text-[13px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11.5px] font-medium text-zinc-300">
                        Proficiency
                      </label>
                      <select
                        value={skillForm.proficiency}
                        onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                        className="w-full h-8.5 px-3 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white focus:outline-none capitalize text-[13px]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    {/* Quick Recommended Skills */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Popular Suggestions
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar pr-1">
                        {UNIVERSAL_SKILLS.filter(
                          (s) => !skillForm.name || s.toLowerCase().includes(skillForm.name.toLowerCase())
                        )
                          .slice(0, 16)
                          .map((s) => {
                            const isAdded = profileSkills.some(
                              (ps: SkillItem) => ps.name.toLowerCase() === s.toLowerCase()
                            );
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={isAdded}
                                onClick={() => setSkillForm({ ...skillForm, name: s })}
                                className={cn(
                                  "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                                  isAdded
                                    ? "bg-white/5 border-white/5 text-zinc-500 cursor-not-allowed"
                                    : "bg-[var(--app-nested)] border-[var(--app-border-strong)] text-zinc-300 hover:text-white hover:border-zinc-700"
                                )}
                              >
                                {s} {isAdded && "✓"}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border-strong)]">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="h-8 px-3 rounded-md bg-[#18181b] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!skillForm.name.trim() || mutAddSkill.isPending}
                      className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {mutAddSkill.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Add Skill</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
