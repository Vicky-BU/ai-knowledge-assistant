import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Payload Missing: 未在请求体中发现有效的文件对象。" },
        { status: 400 },
      );
    }

    // 🚀 步骤 2：在内存中将文件快速转化成标准的 Blob 格式，准备向 Google 发射
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // 🚀 步骤 3：调用 Google 原生 Files API，完全零依赖、免存储费托管（48小时后自动销毁）
    const uploadResult = await ai.files.upload({
      file: blob,
    });

    // 转发 Google 云端唯一指针 URL 给前端
    return NextResponse.json(
      {
        message: "Google 临时文件保险箱锁定成功。",
        fileUri: uploadResult.uri,
        fileName: file.name,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "未知网关异常";
    console.error("Google Files API 上传致命故障:", errorMessage);
    return NextResponse.json(
      { error: `Google 存储侧异常故障: ${errorMessage}` },
      { status: 500 },
    );
  }
}
