import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 🚀 步骤 5：接收用户输入的问题，以及在前端状态机暂存的 fileUri 文件指针 Key
    const { question, contextText } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "问题内容不能为空。" }), {
        status: 400,
      });
    }

    // 🚀 步骤 6 & 7：级联调用官方原生的 generateContentStream 模型流式对讲机
    // 使用当前 AI Studio 免费层多模态首选节点 gemini-2.5-flash
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: [
        // 核心：若携带文件指针，则直接绑定多模态 fileData 节点，Gemini 将自带眼球直连并理解该文件
        ...(contextText
          ? [
              {
                fileData: {
                  fileUri: contextText,
                  mimeType: "application/pdf",
                },
              },
            ]
          : []),
        {
          text: `你是一个全栈多模态 AI 企业知识库助手。请基于附加的 PDF 文档内容，用专业、严谨且富有条理的中文回答用户的问题。如果无法从文档中推导出来，请礼貌告知。严禁胡编乱造、凭空捏造事实。\n\n用户当前问题：${question}`,
        },
      ],
      config: {
        temperature: 0.2, // 低温度系数锁死模型，确保开卷考试不幻觉
      },
    });

    // 🚀 步骤 8：将 Google 原厂原生的 Stream 翻译转换为浏览器无缝可接收的 ReadableStream 文本流
    const encoder = new TextEncoder();
    const customTextStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customTextStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "未知推理异常";
    console.error("AI 核心路由发生不可逆阻断:", errorMessage);
    return new Response(
      JSON.stringify({ error: `AI 推理链路中断故障: ${errorMessage}` }),
      { status: 500 },
    );
  }
}
