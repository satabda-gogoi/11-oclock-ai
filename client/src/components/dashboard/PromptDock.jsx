import { useState, useRef } from "react";
import { Paperclip, X, Send, Image, FileText, Clock, Zap } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function PromptDock({ promptInput, setPromptInput, isExecuting, onSubmit, activeApp, isSubscribed = true, onUpgradeClick }) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmission(e);
    }
  };

  const handleTextareaChange = (e) => {
    setPromptInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };
  const [showSchedulePopover, setShowSchedulePopover] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleType, setScheduleType] = useState("once"); // "once" or "daily"
  const [scheduledTime, setScheduledTime] = useState("");
  const [dailyTime, setDailyTime] = useState("");

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const updatedFiles = [...attachedFiles];

    for (const file of selectedFiles) {
      // 🛡️ GUARDRAILS: Enforce file size restrictions to stay inside free tier limits
      const isImage = file.type.startsWith("image/");
      const maxSize = isImage ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for Images, 2MB for Docs

      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds the size limit (${isImage ? "5MB" : "2MB"}).`);
        continue;
      }

      try {
        // Construct a unique storage path layout string inside our bucket
        const fileExtension = file.name.split(".").pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const storagePath = `uploads/${uniqueFileName}`;

        // Stream the binary asset straight to Supabase Storage
        const { data, error } = await supabase.storage
          .from("horizon-media")
          .upload(storagePath, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        // Retrieve the permanent public serving URL string
        const { data: { publicUrl } } = supabase.storage
          .from("horizon-media")
          .getPublicUrl(storagePath);

        updatedFiles.push({
          fileName: file.name,
          fileType: isImage ? "image" : "document",
          fileUrl: publicUrl,
          storagePath: storagePath // Required for backend automatic deletion later
        });

      } catch (uploadError) {
        console.error("Supabase engine storage upload breakdown:", uploadError);
        alert(`Failed to upload "${file.name}". Please try again.`);
      }
    }

    setAttachedFiles(updatedFiles);
    setIsUploading(false);
    // Reset file input value so the same file can be reselected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = async (indexToRemove, storagePath) => {
    try {
      // Clean up asset immediately if user decides to remove it before hitting send
      await supabase.storage.from("horizon-media").remove([storagePath]);
      setAttachedFiles(attachedFiles.filter((_, idx) => idx !== indexToRemove));
    } catch (err) {
      console.error("Failed to delete staged media asset:", err);
    }
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();
    if (!promptInput.trim() && attachedFiles.length === 0) return;

    if (!isSubscribed) {
      onUpgradeClick?.();
      return;
    }

    let schedulingConfig = null;
    if (isScheduled) {
      let parsedTime = undefined;
      if (scheduleType === "once" && scheduledTime) {
        parsedTime = new Date(scheduledTime).toISOString();
      }
      schedulingConfig = {
        scheduleType,
        scheduledTime: parsedTime,
        dailyTime: scheduleType === "daily" ? dailyTime : undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }

    // 💡 INTERCEPT ENGINE: Inject our structural attachments payload block and scheduling configuration
    onSubmit(e, attachedFiles, schedulingConfig);
    setAttachedFiles([]); // Clear attachment stage state block
    setIsScheduled(false);
    setScheduledTime("");
    setDailyTime("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInstantUploadClick = (e) => {
    e.preventDefault();
    if (!promptInput.trim() && attachedFiles.length === 0) return;

    if (!isSubscribed) {
      onUpgradeClick?.();
      return;
    }

    const schedulingConfig = {
      scheduleType: "instant-upload"
    };

    onSubmit(e, attachedFiles, schedulingConfig);
    setAttachedFiles([]);
    setIsScheduled(false);
    setScheduledTime("");
    setDailyTime("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-border bg-card p-4 flex flex-col gap-3 relative">
      
      {/* ⏰ SCHEDULE CONFIGURATION POPOVER DIALOG */}
      {showSchedulePopover && (
        <div className="absolute bottom-16 left-4 z-30 bg-card border border-border rounded-xl p-4 shadow-xl w-72 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-xs font-semibold text-foreground">Schedule Settings</span>
            <button 
              type="button" 
              onClick={() => setShowSchedulePopover(false)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">Recurrence</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScheduleType("once")}
                className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  scheduleType === "once"
                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                    : "bg-background border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                Once
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("daily")}
                className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  scheduleType === "daily"
                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                    : "bg-background border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          {scheduleType === "once" ? (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">Publish Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // at least 1 min in future
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">Daily Publish Time</label>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex flex-row gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                if (scheduleType === "once" && !scheduledTime) {
                  alert("Please specify a date and time to schedule.");
                  return;
                }
                if (scheduleType === "daily" && !dailyTime) {
                  alert("Please specify a daily time to schedule.");
                  return;
                }
                setIsScheduled(true);
                setShowSchedulePopover(false);
              }}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Apply Schedule
            </button>
            {isScheduled && (
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(false);
                  setScheduledTime("");
                  setDailyTime("");
                  setShowSchedulePopover(false);
                }}
                className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 📎 FILE ATTACHMENTS PREVIEW DOCK ZONE */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center px-2 py-1 max-h-24 overflow-y-auto">
          {attachedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-background/60 border border-border px-3 py-1.5 rounded-lg text-xs font-medium max-w-[200px] group relative pr-7">
              {file.fileType === "image" ? (
                <Image className="h-3.5 w-3.5 text-primary" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-sky-500" />
              )}
              <span className="truncate flex-1">{file.fileName}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(idx, file.storagePath)}
                className="absolute right-1.5 text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                disabled={isExecuting}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🛠️ CORE ACTION FORM ASSEMBLY ROW */}
      <form onSubmit={handleFormSubmission} className="flex flex-row items-end gap-2 relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple
          accept="image/*, .txt, .md, .pdf"
          className="hidden" 
        />
        
        <button
          type="button"
          onClick={() => {
            if (!isSubscribed) {
              onUpgradeClick?.();
            } else {
              fileInputRef.current?.click();
            }
          }}
          disabled={isExecuting || isUploading}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-background border border-border hover:bg-accent/40 text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* ⏰ SCHEDULE CONFIGURATION TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => {
            if (!isSubscribed) {
              onUpgradeClick?.();
            } else {
              setShowSchedulePopover(!showSchedulePopover);
            }
          }}
          disabled={isExecuting || isUploading}
          className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mb-0.5 ${
            isScheduled 
              ? "bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20" 
              : "bg-background border-border hover:bg-accent/40 text-muted-foreground"
          }`}
          title="Schedule Post"
        >
          <Clock className="h-4 w-4" />
        </button>

        <div className="flex-1 relative flex items-end bg-background border border-border rounded-xl focus-within:border-primary transition-colors px-3 py-1.5 min-h-[40px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={promptInput}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={
              !isSubscribed
                ? "Draft a high-performing post..."
                : isUploading 
                ? "Streaming file assets securely down to bucket storage..." 
                : activeApp 
                ? `Draft a prompt command sequence for ${activeApp.name}...`
                : "Type your idea, post request, or 'Post this to LinkedIn'..."
            }
            className="w-full bg-transparent border-0 outline-none p-1 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed resize-none max-h-36 scrollbar-none"
          />
        </div>

        <button
          type="button"
          onClick={handleInstantUploadClick}
          disabled={
            isExecuting || 
            isUploading || 
            (!promptInput.trim() && attachedFiles.length === 0) || 
            (activeApp && activeApp.iconKey.toLowerCase() !== "linkedin")
          }
          className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mb-0.5 ${
            !activeApp || activeApp.iconKey.toLowerCase() === "linkedin"
              ? "bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20"
              : "bg-background border-border hover:bg-accent/40 text-muted-foreground opacity-40 cursor-not-allowed"
          }`}
          title={
            !activeApp || activeApp.iconKey.toLowerCase() === "linkedin"
              ? "Instant Post to LinkedIn"
              : "Instant Post is currently supported only for LinkedIn"
          }
        >
          <Zap className="h-4 w-4" />
        </button>

        <button
          type="submit"
          disabled={isExecuting || isUploading || (!promptInput.trim() && attachedFiles.length === 0)}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 mb-0.5 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}