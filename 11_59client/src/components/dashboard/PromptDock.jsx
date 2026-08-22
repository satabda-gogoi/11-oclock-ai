import { useState, useRef } from "react";
import { Paperclip, X, Send, Image, FileText } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function PromptDock({ promptInput, setPromptInput, isExecuting, onSubmit, activeApp, isSubscribed = true, onUpgradeClick }) {
  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

    // 💡 INTERCEPT ENGINE: Inject our structural attachments payload block into the submission pipeline event handler
    onSubmit(e, attachedFiles);
    setAttachedFiles([]); // Clear attachment stage state block
  };

  return (
    <div className="border-t border-border bg-card p-4 flex flex-col gap-3 relative">
      
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
      <form onSubmit={handleFormSubmission} className="flex flex-row items-center gap-2 relative">
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
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-background border border-border hover:bg-accent/40 text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <div className="flex-1 relative flex items-center bg-background border border-border rounded-xl focus-within:border-primary transition-colors px-3 py-1.5">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            disabled={isExecuting}
            placeholder={
              !isSubscribed
                ? "Draft a high-performing post..."
                : !activeApp 
                ? "Select a platform channel from the sidebar first..." 
                : isUploading 
                ? "Streaming file assets securely down to bucket storage..." 
                : `Draft a prompt command sequence for ${activeApp.name}...`
            }
            className="w-full bg-transparent border-0 outline-none p-1 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isExecuting || isUploading || (!promptInput.trim() && attachedFiles.length === 0)}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}