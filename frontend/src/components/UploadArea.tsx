"use client";

import { useState } from "react";
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function UploadArea({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await axios.post(`${API_BASE}/api/v1/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("success");
      setTimeout(() => {
        onUploadSuccess();
      }, 1000);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.response?.data?.detail || "Upload failed");
    }
  };

  return (
    <div className="glass rounded-2xl p-8 mb-8 shadow-2xl animate-fade-in-up border border-white/20">
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
      <p className="text-muted-foreground mb-6">Upload a PDF, DOCX, CSV, or Excel file to begin Agentic analysis.</p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-400 hover:bg-white/5"
        }`}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="font-semibold text-lg mb-2">Drag and drop your file here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <label className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium cursor-pointer hover:scale-105 transition-transform">
              Browse Files
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.csv,.xlsx,.xls" />
            </label>
          </>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex items-center gap-4 bg-background/50 p-4 rounded-lg border">
              <File className="w-8 h-8 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setStatus("idle"); }} className="text-sm text-red-400 hover:text-red-300">Remove</button>
            </div>
            
            {status === "error" && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}
            
            {status === "success" && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-5 h-5" /> Analysis Complete! Redirecting...
              </div>
            )}

            {status !== "success" && (
              <button 
                onClick={handleUpload}
                disabled={status === "uploading"}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                {status === "uploading" ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing with AI Agents...</>
                ) : (
                  "Start Analysis"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
