"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  Activity,
  Settings,
  MousePointer2,
} from "lucide-react";

/* ─── CARD 1: LUMI AI AGENT ILLUSTRATION ──────────────────────────── */
function LumiAgentGraphic() {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[270px] sm:min-h-[290px] select-none pointer-events-none overflow-hidden p-2 sm:p-4">
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <Image
          src="/lumi-feature.png"
          alt="Introducing Lumi"
          width={1024}
          height={576}
          className="w-full max-w-[450px] h-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] [html.light_&]:drop-shadow-none [html.light_&]:invert [html.light_&]:hue-rotate-180 [html.light_&]:brightness-[1.12] [html.light_&]:contrast-[1.08] [html.light_&]:mix-blend-multiply"
          priority
        />
      </motion.div>
    </div>
  );
}

/* ─── CARD 2: CUSTOM KNOWLEDGE BASE (IMAGE ASSET) ─────────────────── */
function VaultGraphic() {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[270px] sm:min-h-[290px] select-none pointer-events-none overflow-hidden p-2 sm:p-4">
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <Image
          src="/knowledge-base.png"
          alt="Custom Knowledge Base"
          width={1024}
          height={576}
          className="w-full max-w-[450px] h-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] [html.light_&]:drop-shadow-none [html.light_&]:invert [html.light_&]:hue-rotate-180 [html.light_&]:brightness-[1.12] [html.light_&]:contrast-[1.08] [html.light_&]:mix-blend-multiply"
          priority
        />
      </motion.div>
    </div>
  );
}

/* ─── CARD 3: SMART AUTOMATION (CURSORS GRAPHIC) ─────────────────── */
function CursorsGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[130px] relative overflow-hidden select-none pointer-events-none">
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-white/[0.03] rounded-full blur-2xl z-0" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Central Document Tile */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-[54px] h-[66px] rounded-[14px] bg-[var(--sx-bg-1c1c1f)] border border-white/[0.12] shadow-[0_12px_28px_rgba(0,0,0,0.6)] flex items-center justify-center z-20 relative"
        >
          <FileText className="w-6 h-6 text-white/90" strokeWidth={1.6} />
        </motion.div>

        {/* Clustered Clicking Cursors */}
        {[
          { x: 30, y: 12, rotate: 15, delay: 0.1 },
          { x: 25, y: 40, rotate: 45, delay: 0.4 },
          { x: 5, y: 50, rotate: 0, delay: 0.7 },
          { x: -26, y: 34, rotate: -30, delay: 1.0 },
        ].map((cursor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [0.8, 1, 0.9, 1],
              x: [cursor.x + 6, cursor.x, cursor.x + 2, cursor.x],
              y: [cursor.y + 6, cursor.y, cursor.y + 2, cursor.y],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: cursor.delay,
              ease: "easeInOut",
            }}
            className="absolute z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${cursor.rotate}deg)`,
              marginTop: cursor.y - 30,
              marginLeft: cursor.x,
            }}
          >
            <MousePointer2 className="w-5 h-5 text-white fill-white stroke-[2px] stroke-black" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── CARD 4: RADAR APPLICATION TRACKING GRAPHIC ─────────────────── */
function RadarGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[130px] relative overflow-hidden select-none pointer-events-none">
      <div className="relative w-[116px] h-[116px] rounded-full border border-white/[0.1] bg-[var(--sx-bg-161619)] flex items-center justify-center shadow-[inset_0_0_24px_rgba(0,0,0,0.8)]">
        {/* Inner concentric ring */}
        <div className="absolute w-[68px] h-[68px] rounded-full border border-white/[0.08]" />

        {/* Radar Sweeping Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(255,255,255,0.18) 360deg)",
          }}
        />

        {/* Center Live Waveform Node */}
        <div className="w-8 h-8 rounded-full bg-[var(--sx-bg-202024)] border border-white/20 flex items-center justify-center z-10 shadow-lg">
          <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
        </div>

        {/* Detected Blip 1 */}
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2.5 right-7 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"
        />

        {/* Detected Blip 2 */}
        <motion.div
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
          className="absolute bottom-5 left-5 w-1.5 h-1.5 rounded-full bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.7)]"
        />
      </div>
    </div>
  );
}

/* ─── CARD 5: ENTERPRISE SECURITY LOCK GRAPHIC ────────────────────── */
function LockGraphic() {
  return (
    <div className="w-full flex justify-center items-center h-[130px] relative overflow-hidden select-none pointer-events-none">
      {/* Background Soft Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] bg-white/[0.04] rounded-full blur-2xl z-0" />

      {/* Code Background Snippet */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] text-[8.5px] font-mono text-zinc-400 select-none">
        <pre className="text-center leading-[1.35]">
          {`{ "agent_id": "job_bot_2", "label":\n"Onboarding/Interview Environment",\n"production_triggers": { "type":\n"event", "source": "verified_fare"\n}, "step_runs": [{ "status":\n"completed", "message": "all set up."\n}],\n"integration": "s2", "type":`}
        </pre>
      </div>

      {/* High-Resolution Lock Asset */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex items-center justify-center"
      >
        <Image
          src="/lock.png"
          alt="Enterprise Security Lock"
          width={100}
          height={100}
          className="w-[96px] h-[96px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] [html.light_&]:drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]"
        />
      </motion.div>
    </div>
  );
}

/* ─── MAIN EXPORTED SECONDARY BENTO COMPONENT ────────────────────── */
export function SecondaryBento() {
  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 relative z-10">
      {/* ── ROW 1: 2 Columns with Asymmetric Mirror Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[466fr_654fr] gap-4 md:gap-5 mb-4 md:mb-5 h-auto lg:h-[480px] items-stretch">
        {/* Card 1: Introducing Lumi */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[24px] bg-[var(--sx-bg-121212)] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.4)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row on Top with Lumi Logo */}
          <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.08]">
            <div className="w-[18px] h-[18px] rounded-[5px] overflow-hidden border border-white/20 shrink-0 bg-[var(--sx-bg-18181b)] flex items-center justify-center">
              <Image
                src="/lumi-logo.png"
                alt="Lumi"
                width={18}
                height={18}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-[var(--sx-tx-e5e5e5)] font-semibold text-[13.5px] sm:text-[14px] tracking-tight">Introducing Lumi</span>
          </div>

          {/* Visual Canvas with Lumi Graphic */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[260px] sm:min-h-[280px]">
            <LumiAgentGraphic />
          </div>

          {/* Bottom Text Area */}
          <div className="px-6 pb-6 pt-2 border-t border-transparent relative z-20">
            <h3 className="text-[14.5px] sm:text-[15px] font-semibold text-white tracking-tight mb-1">
              Your AI job search, working in the background.
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 leading-relaxed font-normal">
              Lumi helps you discover relevant opportunities, evaluate your fit, prepare tailored applications, and keep your job search organized.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Custom Knowledge Base */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[24px] bg-[var(--sx-bg-121212)] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.4)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-white/[0.08]">
            <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.8} />
            <span className="text-[var(--sx-tx-e5e5e5)] font-semibold text-[13.5px] sm:text-[14px] tracking-tight">Custom Knowledge Base</span>
          </div>

          {/* Visual Canvas */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[260px] sm:min-h-[280px]">
            <VaultGraphic />
          </div>

          {/* Bottom Text Area */}
          <div className="px-6 pb-6 pt-2 border-t border-transparent relative z-20">
            <h3 className="text-[14.5px] sm:text-[15px] font-semibold text-white mb-1 tracking-tight">
              Agents that speak your language
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 leading-relaxed font-normal">
              Train your agents with your unique career data, documents, and preferences. Your agents provide tailored applications that reflect your expertise.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── ROW 2: 3 Columns with Standardized Dimensions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 3: Smart Application Automation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[22px] bg-[var(--sx-bg-121212)] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[300px] sm:h-[310px] p-6 sm:p-6.5 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <CursorsGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[14px] sm:text-[14.5px] font-semibold text-white mb-1 tracking-tight">
              Smart Application Automation
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 leading-relaxed font-normal">
              Applivo automatically finds relevant opportunities, fills application forms, and submits them on your behalf.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Real-Time Application Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[22px] bg-[var(--sx-bg-121212)] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[300px] sm:h-[310px] p-6 sm:p-6.5 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <RadarGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[14px] sm:text-[14.5px] font-semibold text-white mb-1 tracking-tight">
              Real-Time Application Tracking
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 leading-relaxed font-normal">
              Track every application, response, and interview update in one unified dashboard with instant notifications.
            </p>
          </div>
        </motion.div>

        {/* Card 5: Enterprise Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
          className="rounded-[22px] bg-[var(--sx-bg-121212)] border border-white/[0.08] hover:border-white/[0.16] overflow-hidden flex flex-col h-[300px] sm:h-[310px] p-6 sm:p-6.5 shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-colors duration-300 justify-between group"
        >
          <div className="flex-1 flex flex-col justify-center">
            <LockGraphic />
          </div>
          <div className="mt-auto pt-2">
            <h3 className="text-[14px] sm:text-[14.5px] font-semibold text-white mb-1 tracking-tight">
              Enterprise Security
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 leading-relaxed font-normal">
              Enterprise-level encryption and granular permissions keep your career data safe.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
