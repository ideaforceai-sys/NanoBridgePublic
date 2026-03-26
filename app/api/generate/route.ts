import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json()

    // 验证输入 - 至少需要提示词
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // 从环境变量获取 API Key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    // 初始化 Google GenAI
    const ai = new GoogleGenAI({ apiKey })

    console.log("Generating image with prompt:", prompt.substring(0, 100))

    // 构建请求内容
    let contents: any

    if (image) {
      // 如果有图片，使用图片+文本模式
      const base64Data = image.split(",")[1]
      const mimeType = image.split(";")[0].split(":")[1]

      contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
      ]
    } else {
      // 纯文本模式
      contents = prompt
    }

    // 调用 Gemini API 生成图片
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: contents,
    })

    console.log("Gemini API response received")

    // 提取生成的图片
    const parts = response.candidates?.[0]?.content?.parts

    if (!parts || parts.length === 0) {
      console.error("No content in response")
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      )
    }

    // 查找图片数据
    for (const part of parts) {
      if (part.text) {
        console.log("Response text:", part.text)
      } else if (part.inlineData) {
        // 找到图片数据
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType || "image/png"

        // 构建完整的 base64 图片数据
        const generatedImage = `data:${mimeType};base64,${imageData}`

        console.log("Image generated successfully")

        return NextResponse.json({
          image: generatedImage,
          success: true
        })
      }
    }

    // 如果没有找到图片
    console.error("No image data in response parts")
    return NextResponse.json(
      { error: "API returned no image data" },
      { status: 500 }
    )

  } catch (error) {
    console.error("Error in generate API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
