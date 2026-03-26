"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Upload, Loader2, Download, RefreshCw, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ImageGenerator() {
  const t = useTranslations("imageGenerator")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast.error(t("error.invalidImage"))
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("error.imageTooLarge"))
      return
    }

    // 读取文件并转换为 base64
    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
      setGeneratedImage(null) // 清除之前的生成结果
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (file && file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        setGeneratedImage(null)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error(t("error.invalidImage"))
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t("error.noPrompt"))
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage, // 可选，如果没有上传图片则为 null
          prompt: prompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error:", data)
        toast.error(data.error || t("error.generateFailed"))
        return
      }

      setGeneratedImage(data.image)
      toast.success(t("success.generateSuccess"))
    } catch (error) {
      console.error("Generation error:", error)
      toast.error(t("error.generateFailed"))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `nanobridge-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRegenerate = () => {
    setGeneratedImage(null)
    handleGenerate()
  }

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
        </div> */}

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 左侧：上传和输入区域 */}
          <div className="space-y-6">
            {/* 图片上传区域 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("uploadImage")}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 transition-colors bg-secondary/20"
              >
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt={t("uploadedImageAlt")}
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(null)
                        setGeneratedImage(null)
                      }}
                    >
                      {t("replaceImage")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-primary" />
                    <div>
                      <p className="text-lg font-medium">{t("dragDrop")}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("uploadImageDesc")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                aria-label={t("uploadImage")}
                className="hidden"
              />
            </div>

            {/* 提示词输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("promptLabel")}
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("promptPlaceholder")}
                className="min-h-32 resize-none"
                disabled={isGenerating}
              />
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {t("generateButton")}
                </>
              )}
            </Button>
          </div>

          {/* 右侧：生成结果区域 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("generatedImage")}
            </label>
            <div className="border-2 border-primary/30 rounded-lg p-8 min-h-[400px] flex items-center justify-center bg-secondary/20">
              {generatedImage ? (
                <div className="space-y-4 w-full">
                  <img
                    src={generatedImage}
                    alt={t("generatedImageAlt")}
                    className="max-h-96 mx-auto rounded-lg"
                  />
                  <div className="flex gap-4">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("download")}
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="flex-1"
                      disabled={isGenerating}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t("regenerate")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t("generatedImagePlaceholder")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
