"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface PdfUploaderProps {
  onUploadSuccess: (fileUri: string, fileName: string) => void;
}

export default function PdfUploader({ onUploadSuccess }: PdfUploaderProps) {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [currentFile, setCurrentFile] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFilePayload = async (file: File): Promise<void> => {
    if (file.type !== "application/pdf") {
      setStatus("error");
      alert("安全异常：本系统目前仅支持标准的 PDF 格式文件。");
      return;
    }

    setStatus("uploading");
    setCurrentFile(file.name);

    try {
      const formData = new FormData();
      // 🚀 步骤 1：直接把原始二进制 File 塞入 FormData，拒绝任何乱码转换
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("服务器拒绝接收该文件对象。");
      const data = await response.json();

      setStatus("success");
      // 🚀 步骤 4：将后端从 Google Files API 拿到的 fileUri 云端指针，回传给全局状态暂存
      onUploadSuccess(data.fileUri, file.name);
    } catch (err: unknown) {
      console.error("上传链路异常崩溃:", err);
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFilePayload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[220px] backdrop-blur-md ${
          isDragActive
            ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.01]"
            : status === "success"
              ? "border-emerald-500/50 bg-emerald-500/5"
              : status === "error"
                ? "border-rose-500/50 bg-rose-500/5"
                : "border-zinc-800 bg-[#18181b]/40 hover:border-zinc-700 hover:bg-[#18181b]/60"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFilePayload(e.target.files[0]);
            }
          }}
          accept="application/pdf"
          className="hidden"
        />

        {status === "idle" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors duration-200 mx-auto">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-wide">
                点击浏览或将 PDF 文件拖拽至此处
              </p>
              <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                PDF 资产专线 (免费云端托管 48小时)
              </p>
            </div>
          </div>
        )}

        {status === "uploading" && (
          <div className="space-y-4 w-full max-w-xs animate-in fade-in duration-200">
            <div className="relative h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto animate-pulse">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-purple-400 truncate">
                同步中继并上传至 Google API 库: {currentFile}
              </p>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                <div className="h-full bg-purple-500 w-1/3 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-400 tracking-wide">
                Google 临时知识容器锁定成功
              </p>
              <p className="text-[11px] font-bold text-zinc-400 mt-0.5 truncate max-w-sm">
                已同步: {currentFile}
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-rose-400 tracking-wide">
                托管管道异常中断
              </p>
              <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                请点击此处重置工作区参数
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
