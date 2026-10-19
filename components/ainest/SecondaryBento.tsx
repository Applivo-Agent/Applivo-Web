"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Plus,
  Send,
  FileText,
  Search,
  Target,
  Brain,
  Activity,
  Lock,
  Star,
  Bot,
  Settings,
  MousePointer2,
  Sparkles
} from "lucide-react";

/* ─── CARD 1: LUMI AI AGENT ILLUSTRATION (MATCHING REFERENCE IMAGE 1) ─── */
function LumiAgentGraphic() {
  const nodes = [
    {
      id: "discover",
      label: "Discover Opportunities",
      icon: Search,
      pos: "top-3 sm:top-5 left-1 sm:left-3",
      delay: 0,
    },
    {
      id: "analyze",
      label: "Analyze Job Fit",
      icon: Target,
      pos: "top-3 sm:top-5 right-1 sm:right-3",
      delay: 0.15,
    },
    {
      id: "tailor",
      label: "Tailor Resume",
      icon: FileText,
      pos: "bottom-5 sm:bottom-7 left-1 sm:left-3",
      delay: 0.3,
    },
    {
      id: "answers",
      label: "Prepare Answers",
      icon: Brain,
      pos: "bottom-5 sm:bottom-7 right-1 sm:right-3",
      delay: 0.45,
    },
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[290px] sm:min-h-[310px] select-none pointer-events-none overflow-hidden">
      {/* SVG Canvas for curved connection splines, glowing junction dots, and horizon */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 380 260"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lumiHorizonGlow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <radialGradient id="junctionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* ── 1. Curved Planetary Horizon Line at the Bottom ── */}
        <path
          d="M -20,248 Q 190,212 400,248"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M -20,248 Q 190,212 400,248 L 400,260 L -20,260 Z"
          fill="url(#lumiHorizonGlow)"
        />

        {/* ── 2. Subtle Decorative Faint Orbital Ellipses ── */}
        <ellipse
          cx="190"
          cy="130"
          rx="125"
          ry="72"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
        <ellipse
          cx="190"
          cy="130"
          rx="168"
          ry="98"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1"
        />

        {/* ── 3. Smooth Curved Spline Connection Lines (Bézier Curves) ── */}
        {/* Top-Left: Center -> Discover Opportunities */}
        <path
          d="M 160,118 C 145,102 135,88 122,76 C 112,65 92,62 65,62"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Glowing Junction Dot (Top-Left) */}
        <circle cx="122" cy="76" r="6" fill="url(#junctionGlow)" />
        <circle cx="122" cy="76" r="2.5" fill="#FFFFFF" />

        {/* Top-Right: Center -> Analyze Job Fit */}
        <path
          d="M 220,118 C 235,102 245,88 258,76 C 268,65 288,62 315,62"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Glowing Junction Dot (Top-Right) */}
        <circle cx="258" cy="76" r="6" fill="url(#junctionGlow)" />
        <circle cx="258" cy="76" r="2.5" fill="#FFFFFF" />

        {/* Bottom-Left: Center -> Tailor Resume */}
        <path
          d="M 160,142 C 145,158 132,170 118,178 C 105,186 85,188 60,188"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Glowing Junction Dot (Bottom-Left) */}
        <circle cx="118" cy="178" r="6" fill="url(#junctionGlow)" />
        <circle cx="118" cy="178" r="2.5" fill="#FFFFFF" />

        {/* Bottom-Right: Center -> Prepare Answers */}
        <path
          d="M 220,142 C 235,158 248,170 262,178 C 275,186 295,188 320,188"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Glowing Junction Dot (Bottom-Right) */}
        <circle cx="262" cy="178" r="6" fill="url(#junctionGlow)" />
        <circle cx="262" cy="178" r="2.5" fill="#FFFFFF" />
      </svg>

      {/* ── Central Focal Element: 3D Squircle Lumi App Icon with Backlight Glow ── */}
      <motion.div
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-30 flex items-center justify-center"
      >
        {/* Rich White Diffused Core Glow behind the Squircle */}
        <div className="absolute w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] rounded-full bg-white/[0.09] blur-2xl pointer-events-none" />

        {/* 3D Beveled Squircle Tile */}
        <div className="relative flex items-center justify-center">
          <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-[20px] sm:rounded-[22px] bg-[#121214] border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.95),0_0_30px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden flex items-center justify-center p-0">
            <Image
              src="/lumi-logo.png"
              alt="Lumi"
              width={78}
              height={78}
              className="w-full h-full object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </motion.div>

      {/* ── Four Floating Feature Labels (Pills matching Reference Image 1) ── */}
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: node.delay, ease: "easeOut" }}
            className={`absolute ${node.pos} z-20 pointer-events-auto`}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#141416]/95 border border-white/[0.14] text-[11px] sm:text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.85)] hover:border-white/30 hover:scale-[1.02] transition-all duration-200">
              <Icon className="w-3.5 h-3.5 text-zinc-300 shrink-0" strokeWidth={1.8} />
              <span className="whitespace-nowrap tracking-tight">{node.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}


/* ─── CARD 2: CUSTOM KNOWLEDGE BASE (EXACT MATCH REFERENCE) ──────── */
function VaultGraphic() {
  return (
    <div className="w-full h-full relative flex items-center justify-center sm:justify-end pr-0 sm:pr-6 min-h-[330px] sm:min-h-[340px] select-none pointer-events-none p-2 sm:p-4 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute w-[380px] h-[240px] rounded-full bg-white/[0.04] blur-3xl pointer-events-none right-4" />

      {/* Composition Wrapper that scales proportionally on mobile */}
      <div className="relative w-full max-w-[440px] sm:max-w-none flex items-center justify-end scale-[0.88] sm:scale-100 origin-center sm:origin-right">
        {/* 1. Main Background Card: Upload to knowledge base (Positioned on the right) */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-[300px] sm:w-[380px] bg-[#141416] border border-white/[0.1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col relative z-10 overflow-hidden mr-0 sm:mr-3"
        >
          {/* Panel Header with divider */}
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.08] flex items-center">
            <p className="text-white text-[12px] sm:text-[13px] font-medium tracking-tight opacity-95">
              Upload to knowledge base
            </p>
          </div>

          {/* Dropzone Box with Dashed Border */}
          <div className="p-3.5 sm:p-5">
            <div className="bg-[#0C0C0E]/90 rounded-xl border border-dashed border-white/[0.14] p-4 sm:p-5 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#1C1C1F] border border-white/10 rounded-xl flex items-center justify-center text-zinc-300 mb-2 sm:mb-2.5 shadow-sm">
                <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" strokeWidth={1.8} />
              </div>

              <p className="text-white text-[13px] sm:text-[13.5px] font-semibold mb-1 tracking-tight">Upload files</p>
              <p className="text-zinc-400 text-[10.5px] sm:text-[11px] leading-relaxed max-w-[190px] sm:max-w-[210px] mb-3 sm:mb-3.5">
                Add docs, PDFs, or URLs to train your agent.
              </p>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#0072f5] hover:bg-[#0062d2] text-white font-medium text-[11px] sm:text-[12px] transition-all shadow-[0_4px_20px_rgba(0,114,245,0.45)]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Select files
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. Floating Front Panel: Attach URL */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="absolute z-20 left-0 sm:left-6 top-[44%] -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-[#18181B] border border-white/[0.14] shadow-[0_24px_55px_rgba(0,0,0,0.95)] w-[215px] sm:w-[285px]"
        >
          <p className="text-zinc-300 text-[10.5px] sm:text-[11px] mb-2 sm:mb-2.5 font-medium tracking-wide">Attach URL</p>
          <div className="flex bg-[#111113] border border-white/10 rounded-xl items-center px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-inner h-[38px] sm:h-[42px]">
            <span className="text-zinc-500 text-[11px] sm:text-xs flex-1">Enter URL</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#222226] border border-white/10 flex items-center justify-center text-zinc-300 ml-1.5 sm:ml-2 shadow-sm">
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-300 -rotate-12 translate-x-[-1px] translate-y-[0.5px]" strokeWidth={2} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── CARD 3: SMART AUTOMATION (CURSORS GRAPHIC) ─────────────────── */
function CursorsGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[140px] relative overflow-hidden select-none pointer-events-none">
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-white/[0.03] rounded-full blur-2xl z-0" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Central Document Tile */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-[60px] h-[72px] rounded-[16px] bg-[#1C1C1F] border border-white/[0.12] shadow-[0_12px_28px_rgba(0,0,0,0.6)] flex items-center justify-center z-20 relative"
        >
          <FileText className="w-7 h-7 text-white/90" strokeWidth={1.6} />
        </motion.div>

        {/* Clustered Clicking Cursors */}
        {[
          { x: 34, y: 14, rotate: 15, delay: 0.1 },
          { x: 28, y: 44, rotate: 45, delay: 0.4 },
          { x: 6, y: 56, rotate: 0, delay: 0.7 },
          { x: -30, y: 38, rotate: -30, delay: 1.0 },
        ].map((cursor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [0.8, 1, 0.9, 1],
              x: [cursor.x + 8, cursor.x, cursor.x + 2, cursor.x],
              y: [cursor.y + 8, cursor.y, cursor.y + 2, cursor.y]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: cursor.delay,
              ease: "easeInOut"
            }}
            className="absolute z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${cursor.rotate}deg)`,
              marginTop: cursor.y - 34,
              marginLeft: cursor.x
            }}
          >
            <MousePointer2 className="w-6 h-6 text-white fill-white stroke-[2px] stroke-black" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── CARD 4: RADAR STATUS GRAPHIC (STRICTLY MONOCHROME) ─────────── */
function RadarGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[140px] relative overflow-hidden select-none pointer-events-none">
      {/* Soft Ambient White Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-white/[0.04] rounded-full blur-2xl z-0" />

      {/* Concentric Radar Rings */}
      <div className="relative w-[130px] h-[130px] rounded-full border border-white/15 flex items-center justify-center">
        <div className="w-[85px] h-[85px] rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-[45px] h-[45px] rounded-full border border-white/20 flex items-center justify-center bg-[#18181B] shadow-inner">
            <Activity className="w-4 h-4 text-zinc-200" strokeWidth={2} />
          </div>
        </div>

        {/* Radar Sweep Needle (Monochrome White Gradient) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 75%, rgba(255, 255, 255, 0.2) 100%)"
          }}
        />

        {/* Radar Blip / Ping Dot (Crisp White Glow) */}
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-6 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]"
        />
      </div>
    </div>
  );
}

/* ─── CARD 5: SECURE CAREER DATA / ENTERPRISE SECURITY (EXACT MATCH REFERENCE) ─── */
const lockCodeBg = `{ "agent_id": "agt_92kxL", "label":
"Onboarding Assistant", "environment":
"production", "triggers": [ { "type":
"event", "source": "signup_form",
"action": "start_onboard" } ],
"workflow": { "steps": [ {
"step_id": "s1", "type": "message",
"content": "Welcome! Let's get you
set up." } ], "limits": {
"max_runs_per_day": 500 } } }`;

function LockGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[160px] relative overflow-hidden select-none pointer-events-none">
      {/* Background Code Texture - Exact JSON from Reference with Radial Mask Vignette */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4"
        style={{
          maskImage: "radial-gradient(circle at center, black 42%, transparent 82%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 42%, transparent 82%)",
        }}
      >
        <pre className="text-[9.5px] text-zinc-400 font-mono leading-[1.65] text-center opacity-60 whitespace-pre">
          {lockCodeBg}
        </pre>
      </div>

      {/* Realistic Solid Padlock (Exact Match to Reference Screenshot) */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center drop-shadow-[0_18px_36px_rgba(0,0,0,0.95)]"
      >
        <svg
          width="114"
          height="126"
          viewBox="0 0 114 126"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shackle Metallic Chrome Specular Gradient */}
            <linearGradient id="shackleMetallicGrad" x1="26" y1="8" x2="84" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="16%" stopColor="#E4E4E7" />
              <stop offset="42%" stopColor="#A1A1AA" />
              <stop offset="75%" stopColor="#52525B" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>

            {/* Lock Body Charcoal Solid Gradient */}
            <linearGradient id="lockBodySolidGrad" x1="57" y1="47" x2="57" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#45454C" />
              <stop offset="15%" stopColor="#323237" />
              <stop offset="55%" stopColor="#202023" />
              <stop offset="100%" stopColor="#121214" />
            </linearGradient>

            {/* Soft Radial Bloom Behind White Star */}
            <radialGradient id="starRadialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Shackle Socket Recesses on Lock Body */}
          <ellipse cx="33" cy="51" rx="8" ry="3" fill="rgba(0,0,0,0.6)" />
          <ellipse cx="81" cy="51" rx="8" ry="3" fill="rgba(0,0,0,0.6)" />

          {/* Shackle (Thick Metallic Arch) */}
          <path
            d="M 33 52 V 31 C 33 17.7 43.7 7 57 7 C 70.3 7 81 17.7 81 31 V 52"
            stroke="url(#shackleMetallicGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Shackle Inner Cutout Shadow Line */}
          <path
            d="M 40.5 48 V 31 C 40.5 21.9 47.9 14.5 57 14.5 C 66.1 14.5 73.5 21.9 73.5 31 V 48"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Lock Body (Solid Rounded Slab) */}
          <rect
            x="12"
            y="47"
            width="90"
            height="73"
            rx="17"
            fill="url(#lockBodySolidGrad)"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />

          {/* Body Top Highlight Bevel */}
          <path
            d="M 28 48.5 H 86"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Inner Depth Stroke */}
          <rect
            x="13.5"
            y="48.5"
            width="87"
            height="70"
            rx="15.5"
            stroke="rgba(0,0,0,0.45)"
            strokeWidth="1"
            fill="none"
          />

          {/* Soft Bloom Glow behind Star */}
          <circle cx="57" cy="83.5" r="22" fill="url(#starRadialGlow)" />

          {/* White Star in Center of Lock Body (Exact 5-Point Star from Reference) */}
          <path
            d="M 57 73 L 59.9 79.8 L 67.2 80.5 L 61.8 85.4 L 63.4 92.5 L 57 88.8 L 50.6 92.5 L 52.2 85.4 L 46.8 80.5 L 54.1 79.8 Z"
            fill="#FFFFFF"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* ─── MAIN EXPORTED SECONDARY BENTO COMPONENT ────────────────────── */
export function SecondaryBento() {
  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 relative z-10">
      {/* ── ROW 1: 2 Columns with Asymmetric Mirror Layout matching Kilo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[466fr_654fr] gap-4 md:gap-5 mb-4 md:mb-5 h-auto lg:h-[530px] items-stretch">
        {/* Card 1: Introducing Lumi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[28px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.4)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row on Top with Lumi Logo */}
          <div className="flex items-center gap-3 px-7 py-4 border-b border-white/[0.08]">
            <div className="w-[20px] h-[20px] rounded-[6px] overflow-hidden border border-white/20 shrink-0 bg-[#18181B] flex items-center justify-center">
              <Image
                src="/lumi-logo.png"
                alt="Lumi"
                width={20}
                height={20}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-[#e5e5e5] font-semibold text-[15px] tracking-tight">Introducing Lumi</span>
          </div>

          {/* Visual Canvas with the New Lumi Graphic */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[290px] sm:min-h-[310px]">
            <LumiAgentGraphic />
          </div>

          {/* Bottom Text Area */}
          <div className="px-7 pb-8 pt-3 border-t border-transparent relative z-20">
            <h3 className="text-[18px] sm:text-[19px] font-semibold text-white tracking-tight mb-2">
              Your AI job search, working in the background.
            </h3>
            <p className="text-[13.5px] sm:text-[14px] text-zinc-400 leading-relaxed">
              Lumi helps you discover relevant opportunities, evaluate your fit, prepare tailored applications, and keep your job search organized.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Custom Knowledge Base */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[28px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.4)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-3 px-7 py-4 border-b border-white/[0.08]">
            <Settings className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.8} />
            <span className="text-[#e5e5e5] font-semibold text-[15px] tracking-tight">Custom Knowledge Base</span>
          </div>

          {/* Visual Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <VaultGraphic />
          </div>

          {/* Bottom Text Area */}
          <div className="px-7 pb-8 pt-3 border-t border-transparent relative z-20">
            <h3 className="text-[18px] font-semibold text-white mb-2 tracking-tight">
              Agents that speak your language
            </h3>
            <p className="text-[14px] text-zinc-400 leading-[1.6]">
              Train your agents with your unique career data, documents, and preferences. Your agents provide tailored applications that reflect your expertise.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── ROW 2: 3 Columns with Standardized Dimensions (h-[340px], rounded-[28px], p-7 sm:p-8) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 3: Smart Application Automation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[340px] p-7 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <CursorsGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[19px] font-semibold text-white mb-2 tracking-tight">
              Smart Application Automation
            </h3>
            <p className="text-[14px] text-zinc-400 leading-[1.6]">
              Applivo automatically finds relevant opportunities, fills application forms, and submits them on your behalf.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Real-Time Application Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[340px] p-7 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <RadarGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[19px] font-semibold text-white mb-2 tracking-tight">
              Real-Time Application Tracking
            </h3>
            <p className="text-[14px] text-zinc-400 leading-[1.6]">
              Track every application, response, and interview update in one unified dashboard with instant notifications.
            </p>
          </div>
        </motion.div>

        {/* Card 5: Enterprise Security */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
          className="rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[340px] p-7 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <LockGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[19px] font-semibold text-white mb-2 tracking-tight">
              Enterprise Security
            </h3>
            <p className="text-[14px] text-zinc-400 leading-[1.6]">
              Enterprise-level encryption and granular permissions keep your career data safe.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

