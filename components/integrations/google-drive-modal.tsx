"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileUp,
  FileDown,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";

interface DriveImportResult {
  resume_id?: string;
  name: string;
  file_size_bytes?: number;
}

interface DriveExportResult {
  file_id?: string;
  name: string;
  web_view_link?: string;
}

interface GoogleDriveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GoogleDriveModal({
  open,
  onOpenChange,
  onSuccess,
}: GoogleDriveModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  
  // Import state
  const [fileId, setFileId] = useState("");
  const [customName, setCustomName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<DriveImportResult | null>(null);

  // Export state
  const [exportDocType, setExportDocType] = useState<"resume" | "cover_letter">("resume");
  const [exportDocId, setExportDocId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<DriveExportResult | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileId.trim()) {
      toast.error("Please provide a Google Drive File ID.");
      return;
    }

    setImporting(true);
    setImportResult(null);
    try {
      const resp = await integrationsApi.driveImport({
        file_id: fileId.trim(),
        name: customName.trim() || undefined,
      });
      setImportResult(resp.data?.imported_resume ?? null);
      toast.success("File successfully imported into your Applivo resume library!");
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to import file from Google Drive.";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportDocId.trim()) {
      toast.error("Please provide the ID of the document to export.");
      return;
    }

    setExporting(true);
    setExportResult(null);
    try {
      const resp = await integrationsApi.driveExport({
        doc_type: exportDocType,
        doc_id: exportDocId.trim(),
      });
      setExportResult(resp.data?.exported_file ?? null);
      toast.success("Document exported to Google Drive!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to export document to Google Drive.";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-[#121215] border border-zinc-800 text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/google-drive.png" alt="Google Drive" className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Google Drive Operations
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Import selected career resumes or export documents using least-privilege permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "import" | "export")}
          className="mt-3 w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="import"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              Import Resume
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <FileUp className="w-3.5 h-3.5 mr-1.5" />
              Export Document
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: IMPORT */}
          <TabsContent value="import" className="space-y-4 pt-3">
            <form onSubmit={handleImport} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="drive-file-id" className="text-xs text-zinc-300">
                  Google Drive File ID <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="drive-file-id"
                  placeholder="e.g. 1A2b3C4d5E6f7G8h9I0j"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500 font-mono"
                  required
                />
                <p className="text-[11px] text-zinc-400">
                  Found in your Drive share link: <code className="text-zinc-300">drive.google.com/file/d/&lt;FILE_ID&gt;/view</code>. Only PDF files up to 10MB are imported.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="drive-custom-name" className="text-xs text-zinc-300">
                  Resume Title in Applivo (Optional)
                </Label>
                <Input
                  id="drive-custom-name"
                  placeholder="e.g. Senior Software Engineer 2026"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-3 text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300">Security Guarantee: </strong>
                Applivo only accesses the specific file ID you submit. We never index or scan unrelated files in your Drive.
              </div>

              {importResult && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/20 flex items-center gap-2.5 text-xs text-white">
                  <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                  <div>
                    <span className="font-medium text-white">{importResult.name}</span>
                    <span className="text-zinc-400 block text-[11px]">
                      Imported as active resume ({Math.round((importResult.file_size_bytes || 0) / 1024)} KB)
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={importing || !fileId.trim()}
                className="w-full text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-medium"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Downloading & Validating...
                  </>
                ) : (
                  "Import Selected File"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: EXPORT */}
          <TabsContent value="export" className="space-y-4 pt-3">
            <form onSubmit={handleExport} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Document Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportDocType("resume")}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      exportDocType === "resume"
                        ? "bg-zinc-800 border-white/20 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mb-1 text-zinc-300" />
                    <span className="font-medium block">Resume</span>
                    <span className="text-[10px] text-zinc-400">PDF career document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportDocType("cover_letter")}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      exportDocType === "cover_letter"
                        ? "bg-zinc-800 border-white/20 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mb-1 text-zinc-300" />
                    <span className="font-medium block">Cover Letter</span>
                    <span className="text-[10px] text-zinc-400">Targeted application letter</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="export-doc-id" className="text-xs text-zinc-300">
                  Document ID <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="export-doc-id"
                  placeholder="e.g. UUID from your Resumes or Letters tab"
                  value={exportDocId}
                  onChange={(e) => setExportDocId(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-xs text-white placeholder:text-zinc-500 font-mono"
                  required
                />
              </div>

              {exportResult && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-between gap-2.5 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                    <div>
                      <span className="font-medium text-white">{exportResult.name}</span>
                      <span className="text-zinc-400 block text-[11px]">Successfully created in your Drive</span>
                    </div>
                  </div>
                  {exportResult.web_view_link && (
                    <a
                      href={exportResult.web_view_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-zinc-200 hover:text-white underline shrink-0"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={exporting || !exportDocId.trim()}
                className="w-full text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-medium"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Uploading to Google Drive...
                  </>
                ) : (
                  "Export to Google Drive"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
