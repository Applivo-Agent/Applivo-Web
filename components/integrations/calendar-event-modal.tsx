"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";

interface CreatedEvent {
  event_id?: string;
  summary?: string;
  html_link?: string;
  start?: string;
  end?: string;
  is_duplicate?: boolean;
}

interface CalendarEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CalendarEventModal({
  open,
  onOpenChange,
  onSuccess,
}: CalendarEventModalProps) {
  // Default to tomorrow 10:00 AM in ISO format local
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    // format as YYYY-MM-DDTHH:mm
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle] = useState("");
  const [startDateTime, setStartDateTime] = useState(getDefaultDateTime());
  const [duration, setDuration] = useState(45);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an event or interview title.");
      return;
    }

    setSubmitting(true);
    setCreatedEvent(null);
    try {
      // Convert to ISO 8601 string
      const localDate = new Date(startDateTime);
      const isoString = localDate.toISOString();

      const resp = await integrationsApi.createCalendarEvent({
        title: title.trim(),
        start_time: isoString,
        duration_minutes: duration,
        meeting_link: meetingLink.trim() || undefined,
        description: notes.trim() || undefined,
        user_timezone: timezone,
      });

      const eventData = resp.data?.event;
      setCreatedEvent(eventData ?? null);
      if (eventData?.is_duplicate) {
        toast.info("Existing calendar event found with this title and time.");
      } else {
        toast.success("Event scheduled on your Google Calendar!");
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to create Google Calendar event.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-[#121215] border border-zinc-800 text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/google-calendar.png" alt="Google Calendar" className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Schedule Interview or Reminder
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Create verified calendar events with duplicate prevention and timezone sync.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSchedule} className="space-y-3.5 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-title" className="text-xs text-zinc-300">
              Event Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="event-title"
              placeholder="e.g. Technical Screening with Acme Corp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-datetime" className="text-xs text-zinc-300">
                Date &amp; Time <span className="text-red-400">*</span>
              </Label>
              <Input
                id="event-datetime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Duration</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-md border text-xs font-medium transition-colors ${
                      duration === mins
                        ? "bg-zinc-800 border-white/20 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-link" className="text-xs text-zinc-300">
              Meeting Link or Location (Optional)
            </Label>
            <Input
              id="event-link"
              placeholder="https://meet.google.com/xyz or Zoom link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-notes" className="text-xs text-zinc-300">
              Interview Notes &amp; Preparation (Optional)
            </Label>
            <Textarea
              id="event-notes"
              placeholder="Prep notes, topics to review, questions to ask the interviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
            <span>
              Timezone: <strong className="text-zinc-300 font-medium">{timezone}</strong>
            </span>
          </div>

          {createdEvent && (
            <div className="p-3 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-between gap-2.5 text-xs text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                <div>
                  <span className="font-medium text-white">{createdEvent.summary}</span>
                  <span className="text-zinc-400 block text-[11px]">
                    {createdEvent.is_duplicate ? "Existing event verified" : "Event successfully added to Google Calendar"}
                  </span>
                </div>
              </div>
              {createdEvent.html_link && (
                <a
                  href={createdEvent.html_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-200 hover:text-white underline shrink-0"
                >
                  <span>Open in Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-medium px-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Schedule on Calendar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
