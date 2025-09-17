"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Palette, FileText, Layout, Save, Eye, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DesignSettings {
  theme: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  pageSize: string
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  header: {
    enabled: boolean
    height: number
    content: string
    showLogo: boolean
    logoImage?: string
    imagePosition: "left" | "center" | "right"
    imageRotation: number
    imageMode: "contain" | "cover" | "fill" | "stretch"
  }
  footer: {
    enabled: boolean
    height: number
    content: string
    showPageNumbers: boolean
  }
  watermark: {
    enabled: boolean
    text: string
    opacity: number
    image?: string
    useImage: boolean
    position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
    rotation: number
    mode: "contain" | "cover" | "fill" | "tile"
    size: number
  }
}

export default function DesignerPage() {
  const { toast } = useToast()
  const headerImageRef = useRef<HTMLInputElement>(null)
  const watermarkImageRef = useRef<HTMLInputElement>(null)
  const [previewMode, setPreviewMode] = useState(false) // Added preview mode state

  const defaultSettings: DesignSettings = {
    theme: "professional",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 1.5,
    pageSize: "A4",
    margins: {
      top: 25,
      right: 25,
      bottom: 25,
      left: 25,
    },
    header: {
      enabled: true,
      height: 60,
      content: "Proposal Penawaran",
      showLogo: true,
      imagePosition: "center",
      imageRotation: 0,
      imageMode: "contain",
    },
    footer: {
      enabled: true,
      height: 40,
      content: "© 2024 Your Company Name",
      showPageNumbers: true,
    },
    watermark: {
      enabled: false,
      text: "CONFIDENTIAL",
      opacity: 10,
      useImage: false,
      position: "center",
      rotation: -45,
      mode: "contain",
      size: 200,
    },
  }

  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultSettings)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("designerSettings")
      if (savedSettings) {
        try {
          setDesignSettings(JSON.parse(savedSettings))
        } catch (error) {
          console.error("Failed to parse saved settings:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    const loadGoogleFont = (fontFamily: string) => {
      const link = document.createElement("link")
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(" ", "+")}:wght@300;400;500;600;700&display=swap`
      link.rel = "stylesheet"
      document.head.appendChild(link)
    }

    // Load the selected font
    if (designSettings.fontFamily) {
      loadGoogleFont(designSettings.fontFamily)
    }
  }, [designSettings.fontFamily])

  const themes = [
    { id: "professional", name: "Professional", description: "Clean and formal business style" },
    { id: "modern", name: "Modern", description: "Contemporary design with bold elements" },
    { id: "minimal", name: "Minimal", description: "Simple and elegant layout" },
    { id: "creative", name: "Creative", description: "Colorful and dynamic design" },
  ]

  const fonts = [
    { id: "Inter", name: "Inter" },
    { id: "Roboto", name: "Roboto" },
    { id: "Open Sans", name: "Open Sans" },
    { id: "Lato", name: "Lato" },
    { id: "Poppins", name: "Poppins" },
    { id: "Montserrat", name: "Montserrat" }, // Added more font options
    { id: "Source Sans Pro", name: "Source Sans Pro" },
  ]

  const pageSizes = [
    { id: "A4", name: "A4 (210 × 297 mm)" },
    { id: "Letter", name: "Letter (8.5 × 11 in)" },
    { id: "Legal", name: "Legal (8.5 × 14 in)" },
  ]

  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateDesignSettings("header.logoImage", e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWatermarkImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateDesignSettings("watermark.image", e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("designerSettings", JSON.stringify(designSettings))
    }
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan desain berhasil disimpan dan akan diterapkan pada proposal selanjutnya.",
    })
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
    toast({
      title: previewMode ? "Mode Edit" : "Mode Preview",
      description: previewMode ? "Kembali ke mode edit" : "Menampilkan preview dokumen lengkap",
    })
  }

  const updateDesignSettings = (path: string, value: any) => {
    const keys = path.split(".")
    setDesignSettings((prev) => {
      const updated = { ...prev }
      let current: any = updated
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  const getWatermarkPositionStyles = () => {
    const baseStyles = {
      opacity: designSettings.watermark.opacity / 100,
      transform: `rotate(${designSettings.watermark.rotation}deg)`,
      maxWidth: `${designSettings.watermark.size}px`,
      maxHeight: `${designSettings.watermark.size}px`,
    }

    switch (designSettings.watermark.position) {
      case "top-left":
        return { ...baseStyles, top: "20px", left: "20px", position: "absolute" as const }
      case "top-right":
        return { ...baseStyles, top: "20px", right: "20px", position: "absolute" as const }
      case "bottom-left":
        return { ...baseStyles, bottom: "20px", left: "20px", position: "absolute" as const }
      case "bottom-right":
        return { ...baseStyles, bottom: "20px", right: "20px", position: "absolute" as const }
      default: // center
        return {
          ...baseStyles,
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${designSettings.watermark.rotation}deg)`,
        }
    }
  }

  const getHeaderImageStyles = () => {
    const baseStyles = {
      maxHeight: "40px",
      objectFit: designSettings.header.imageMode as any,
      transform: `rotate(${designSettings.header.imageRotation}deg)`,
    }

    switch (designSettings.header.imagePosition) {
      case "left":
        return { ...baseStyles, marginRight: "auto" }
      case "right":
        return { ...baseStyles, marginLeft: "auto" }
      default: // center
        return { ...baseStyles, margin: "0 auto" }
    }
  }

  const FullPreview = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Preview Dokumen</h2>
          <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)} className="hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-8">
          <div
            className="bg-white border shadow-lg mx-auto"
            style={{
              width: designSettings.pageSize === "A4" ? "210mm" : "8.5in",
              minHeight: designSettings.pageSize === "A4" ? "297mm" : "11in",
              padding: `${designSettings.margins.top}mm ${designSettings.margins.right}mm ${designSettings.margins.bottom}mm ${designSettings.margins.left}mm`,
              fontFamily: `'${designSettings.fontFamily}', sans-serif`,
              fontSize: `${designSettings.fontSize}pt`,
              lineHeight: designSettings.lineHeight,
              color: designSettings.primaryColor,
              position: "relative",
            }}
          >
            {/* Header */}
            {designSettings.header.enabled && (
              <div className="border-b pb-4 mb-6" style={{ height: `${designSettings.header.height}px` }}>
                {designSettings.header.showLogo && designSettings.header.logoImage && (
                  <div
                    className={`mb-2 ${designSettings.header.imagePosition === "center" ? "text-center" : designSettings.header.imagePosition === "right" ? "text-right" : "text-left"}`}
                  >
                    <img
                      src={designSettings.header.logoImage || "/placeholder.svg"}
                      alt="Logo"
                      style={getHeaderImageStyles()}
                    />
                  </div>
                )}
                <h1
                  className={`font-bold text-xl ${designSettings.header.imagePosition === "center" ? "text-center" : designSettings.header.imagePosition === "right" ? "text-right" : "text-left"}`}
                >
                  {designSettings.header.content}
                </h1>
              </div>
            )}

            {/* Content */}
            <div className="space-y-4">
              <h2 className="font-bold text-lg" style={{ color: designSettings.primaryColor }}>
                PROPOSAL PENAWARAN
              </h2>
              <div className="space-y-2">
                <p>Kepada Yth,</p>
                <p>Bapak/Ibu Pimpinan</p>
                <p>PT. Contoh Perusahaan</p>
                <p>Jakarta</p>
              </div>
              <p className="mt-4">Dengan hormat,</p>
              <p>
                Kami bermaksud mengajukan penawaran untuk kebutuhan perusahaan Bapak/Ibu. Berikut adalah detail
                penawaran kami:
              </p>

              <div className="mt-6">
                <h3 className="font-semibold mb-3" style={{ color: designSettings.secondaryColor }}>
                  Detail Penawaran:
                </h3>
                <div className="space-y-2">
                  <p>• Layanan profesional sesuai kebutuhan</p>
                  <p>• Implementasi dengan standar kualitas tinggi</p>
                  <p>• Support dan maintenance berkelanjutan</p>
                </div>
              </div>

              <p className="mt-6">
                Demikian proposal ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
              </p>

              <div className="mt-8">
                <p>Hormat kami,</p>
                <div className="mt-12">
                  <p className="font-semibold">Nama Perusahaan</p>
                  <p>Direktur</p>
                </div>
              </div>
            </div>

            {/* Watermark */}
            {designSettings.watermark.enabled && (
              <div className="absolute inset-0 pointer-events-none">
                {designSettings.watermark.useImage && designSettings.watermark.image ? (
                  <img
                    src={designSettings.watermark.image || "/placeholder.svg"}
                    alt="Watermark"
                    style={{
                      ...getWatermarkPositionStyles(),
                      objectFit:
                        designSettings.watermark.mode === "tile" ? "repeat" : (designSettings.watermark.mode as any),
                    }}
                  />
                ) : (
                  <span className="text-6xl font-bold text-gray-400 absolute" style={getWatermarkPositionStyles()}>
                    {designSettings.watermark.text}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            {designSettings.footer.enabled && (
              <div
                className="border-t pt-4 mt-8 text-center text-sm"
                style={{ height: `${designSettings.footer.height}px` }}
              >
                <p>{designSettings.footer.content}</p>
                {designSettings.footer.showPageNumbers && <p className="mt-1">Halaman 1</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Designer</h1>
              <p className="text-muted-foreground">Atur desain dan tema halaman proposal</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Tutup Preview" : "Preview"}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Settings Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="theme" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="theme">Tema</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="overlay">Overlay</TabsTrigger>
                </TabsList>

                {/* Theme Tab */}
                <TabsContent value="theme" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Tema & Warna
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Pilih Tema</Label>
                        <div className="grid gap-3 mt-2">
                          {themes.map((theme) => (
                            <div
                              key={theme.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                designSettings.theme === theme.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-accent/50"
                              }`}
                              onClick={() => updateDesignSettings("theme", theme.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{theme.name}</p>
                                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                                </div>
                                {designSettings.theme === theme.id && <Badge>Aktif</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="primaryColor">Warna Primer</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={designSettings.primaryColor}
                              onChange={(e) => updateDesignSettings("primaryColor", e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={designSettings.primaryColor}
                              onChange={(e) => updateDesignSettings("primaryColor", e.target.value)}
                              placeholder="#2563eb"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={designSettings.secondaryColor}
                              onChange={(e) => updateDesignSettings("secondaryColor", e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={designSettings.secondaryColor}
                              onChange={(e) => updateDesignSettings("secondaryColor", e.target.value)}
                              placeholder="#64748b"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Pengaturan Halaman
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Ukuran Halaman</Label>
                        <Select
                          value={designSettings.pageSize}
                          onValueChange={(value) => updateDesignSettings("pageSize", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pageSizes.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Margin Halaman (mm)</Label>
                        <div className="grid gap-3 mt-2">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <Label className="text-sm">Atas</Label>
                              <Slider
                                value={[designSettings.margins.top]}
                                onValueChange={([value]) => updateDesignSettings("margins.top", value)}
                                max={50}
                                min={10}
                                step={5}
                                className="mt-1"
                              />
                              <span className="text-xs text-muted-foreground">{designSettings.margins.top}mm</span>
                            </div>
                            <div>
                              <Label className="text-sm">Bawah</Label>
                              <Slider
                                value={[designSettings.margins.bottom]}
                                onValueChange={([value]) => updateDesignSettings("margins.bottom", value)}
                                max={50}
                                min={10}
                                step={5}
                                className="mt-1"
                              />
                              <span className="text-xs text-muted-foreground">{designSettings.margins.bottom}mm</span>
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <Label className="text-sm">Kiri</Label>
                              <Slider
                                value={[designSettings.margins.left]}
                                onValueChange={([value]) => updateDesignSettings("margins.left", value)}
                                max={50}
                                min={10}
                                step={5}
                                className="mt-1"
                              />
                              <span className="text-xs text-muted-foreground">{designSettings.margins.left}mm</span>
                            </div>
                            <div>
                              <Label className="text-sm">Kanan</Label>
                              <Slider
                                value={[designSettings.margins.right]}
                                onValueChange={([value]) => updateDesignSettings("margins.right", value)}
                                max={50}
                                min={10}
                                step={5}
                                className="mt-1"
                              />
                              <span className="text-xs text-muted-foreground">{designSettings.margins.right}mm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Typography Tab */}
                <TabsContent value="typography" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Typography
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Font Family</Label>
                        <Select
                          value={designSettings.fontFamily}
                          onValueChange={(value) => updateDesignSettings("fontFamily", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fonts.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                <span style={{ fontFamily: `'${font.name}', sans-serif` }}>{font.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Ukuran Font</Label>
                        <Slider
                          value={[designSettings.fontSize]}
                          onValueChange={([value]) => updateDesignSettings("fontSize", value)}
                          max={16}
                          min={8}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-sm text-muted-foreground">{designSettings.fontSize}pt</span>
                      </div>

                      <div>
                        <Label>Line Height</Label>
                        <Slider
                          value={[designSettings.lineHeight]}
                          onValueChange={([value]) => updateDesignSettings("lineHeight", value)}
                          max={2}
                          min={1}
                          step={0.1}
                          className="mt-2"
                        />
                        <span className="text-sm text-muted-foreground">{designSettings.lineHeight}</span>
                      </div>

                      <div className="mt-4 p-4 border rounded-lg bg-white">
                        <Label className="text-sm font-medium">Preview Typography:</Label>
                        <div
                          className="mt-2 space-y-2"
                          style={{
                            fontFamily: `'${designSettings.fontFamily}', sans-serif`,
                            fontSize: `${designSettings.fontSize}pt`,
                            lineHeight: designSettings.lineHeight,
                            color: designSettings.primaryColor,
                          }}
                        >
                          <h3 className="font-bold">Heading Example</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Overlay Tab */}
                <TabsContent value="overlay" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Header</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Aktifkan Header</Label>
                        <Switch
                          checked={designSettings.header.enabled}
                          onCheckedChange={(checked) => updateDesignSettings("header.enabled", checked)}
                        />
                      </div>
                      {designSettings.header.enabled && (
                        <>
                          <div>
                            <Label>Konten Header</Label>
                            <Input
                              value={designSettings.header.content}
                              onChange={(e) => updateDesignSettings("header.content", e.target.value)}
                              placeholder="Judul header"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Tampilkan Logo</Label>
                            <Switch
                              checked={designSettings.header.showLogo}
                              onCheckedChange={(checked) => updateDesignSettings("header.showLogo", checked)}
                            />
                          </div>
                          {designSettings.header.showLogo && (
                            <>
                              <div>
                                <Label>Upload Logo (PNG/JPG)</Label>
                                <div className="flex gap-2 mt-1">
                                  <Button
                                    variant="outline"
                                    onClick={() => headerImageRef.current?.click()}
                                    className="flex-1"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Pilih Gambar
                                  </Button>
                                  {designSettings.header.logoImage && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateDesignSettings("header.logoImage", undefined)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <input
                                  ref={headerImageRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHeaderImageUpload}
                                  className="hidden"
                                />
                                {designSettings.header.logoImage && (
                                  <div className="mt-2">
                                    <img
                                      src={designSettings.header.logoImage || "/placeholder.svg"}
                                      alt="Header Logo"
                                      className="max-h-16 border rounded"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <Label>Posisi Logo</Label>
                                <Select
                                  value={designSettings.header.imagePosition}
                                  onValueChange={(value) => updateDesignSettings("header.imagePosition", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Kiri</SelectItem>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="right">Kanan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Rotasi Logo (derajat)</Label>
                                <Slider
                                  value={[designSettings.header.imageRotation]}
                                  onValueChange={([value]) => updateDesignSettings("header.imageRotation", value)}
                                  max={360}
                                  min={-360}
                                  step={15}
                                  className="mt-2"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {designSettings.header.imageRotation}°
                                </span>
                              </div>

                              <div>
                                <Label>Mode Gambar</Label>
                                <Select
                                  value={designSettings.header.imageMode}
                                  onValueChange={(value) => updateDesignSettings("header.imageMode", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contain">Contain (Proporsional)</SelectItem>
                                    <SelectItem value="cover">Cover (Penuh)</SelectItem>
                                    <SelectItem value="fill">Fill (Regangkan)</SelectItem>
                                    <SelectItem value="stretch">Stretch (Rentang)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Footer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Aktifkan Footer</Label>
                        <Switch
                          checked={designSettings.footer.enabled}
                          onCheckedChange={(checked) => updateDesignSettings("footer.enabled", checked)}
                        />
                      </div>
                      {designSettings.footer.enabled && (
                        <>
                          <div>
                            <Label>Konten Footer</Label>
                            <Input
                              value={designSettings.footer.content}
                              onChange={(e) => updateDesignSettings("footer.content", e.target.value)}
                              placeholder="Teks footer"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Nomor Halaman</Label>
                            <Switch
                              checked={designSettings.footer.showPageNumbers}
                              onCheckedChange={(checked) => updateDesignSettings("footer.showPageNumbers", checked)}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Watermark</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Aktifkan Watermark</Label>
                        <Switch
                          checked={designSettings.watermark.enabled}
                          onCheckedChange={(checked) => updateDesignSettings("watermark.enabled", checked)}
                        />
                      </div>
                      {designSettings.watermark.enabled && (
                        <>
                          <div className="flex items-center justify-between">
                            <Label>Gunakan Gambar</Label>
                            <Switch
                              checked={designSettings.watermark.useImage}
                              onCheckedChange={(checked) => updateDesignSettings("watermark.useImage", checked)}
                            />
                          </div>

                          {designSettings.watermark.useImage ? (
                            <>
                              <div>
                                <Label>Upload Watermark (PNG/JPG)</Label>
                                <div className="flex gap-2 mt-1">
                                  <Button
                                    variant="outline"
                                    onClick={() => watermarkImageRef.current?.click()}
                                    className="flex-1"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Pilih Gambar
                                  </Button>
                                  {designSettings.watermark.image && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateDesignSettings("watermark.image", undefined)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <input
                                  ref={watermarkImageRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleWatermarkImageUpload}
                                  className="hidden"
                                />
                                {designSettings.watermark.image && (
                                  <div className="mt-2">
                                    <img
                                      src={designSettings.watermark.image || "/placeholder.svg"}
                                      alt="Watermark"
                                      className="max-h-16 border rounded"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <Label>Posisi Watermark</Label>
                                <Select
                                  value={designSettings.watermark.position}
                                  onValueChange={(value) => updateDesignSettings("watermark.position", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="top-left">Kiri Atas</SelectItem>
                                    <SelectItem value="top-right">Kanan Atas</SelectItem>
                                    <SelectItem value="bottom-left">Kiri Bawah</SelectItem>
                                    <SelectItem value="bottom-right">Kanan Bawah</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Ukuran Watermark</Label>
                                <Slider
                                  value={[designSettings.watermark.size]}
                                  onValueChange={([value]) => updateDesignSettings("watermark.size", value)}
                                  max={400}
                                  min={50}
                                  step={25}
                                  className="mt-2"
                                />
                                <span className="text-sm text-muted-foreground">{designSettings.watermark.size}px</span>
                              </div>

                              <div>
                                <Label>Mode Gambar</Label>
                                <Select
                                  value={designSettings.watermark.mode}
                                  onValueChange={(value) => updateDesignSettings("watermark.mode", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contain">Contain (Proporsional)</SelectItem>
                                    <SelectItem value="cover">Cover (Penuh)</SelectItem>
                                    <SelectItem value="fill">Fill (Regangkan)</SelectItem>
                                    <SelectItem value="tile">Tile (Ulangi)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label>Teks Watermark</Label>
                              <Input
                                value={designSettings.watermark.text}
                                onChange={(e) => updateDesignSettings("watermark.text", e.target.value)}
                                placeholder="CONFIDENTIAL"
                              />
                            </div>
                          )}

                          <div>
                            <Label>Rotasi (derajat)</Label>
                            <Slider
                              value={[designSettings.watermark.rotation]}
                              onValueChange={([value]) => updateDesignSettings("watermark.rotation", value)}
                              max={360}
                              min={-360}
                              step={15}
                              className="mt-2"
                            />
                            <span className="text-sm text-muted-foreground">{designSettings.watermark.rotation}°</span>
                          </div>

                          <div>
                            <Label>Opacity</Label>
                            <Slider
                              value={[designSettings.watermark.opacity]}
                              onValueChange={([value]) => updateDesignSettings("watermark.opacity", value)}
                              max={50}
                              min={5}
                              step={5}
                              className="mt-2"
                            />
                            <span className="text-sm text-muted-foreground">{designSettings.watermark.opacity}%</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Pratinjau desain proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded-lg p-4 bg-white text-black min-h-[400px] shadow-sm relative overflow-hidden"
                    style={{
                      fontFamily: `'${designSettings.fontFamily}', sans-serif`,
                      fontSize: `${designSettings.fontSize}px`,
                      lineHeight: designSettings.lineHeight,
                      color: designSettings.primaryColor,
                    }}
                  >
                    {designSettings.header.enabled && (
                      <div className="border-b pb-2 mb-4 text-center">
                        {designSettings.header.showLogo && designSettings.header.logoImage && (
                          <img
                            src={designSettings.header.logoImage || "/placeholder.svg"}
                            alt="Logo"
                            className="mx-auto mb-1"
                            style={{ maxHeight: "24px", objectFit: "contain" }}
                          />
                        )}
                        <h3 className="font-bold text-sm">{designSettings.header.content}</h3>
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-xs">PROPOSAL PENAWARAN</h4>
                      <p className="text-xs">Kepada Yth,</p>
                      <p className="text-xs">Bapak/Ibu Pimpinan</p>
                      <p className="text-xs">PT. Contoh Perusahaan</p>
                      <p className="text-xs mt-2">Dengan hormat, kami bermaksud mengajukan penawaran untuk...</p>
                    </div>
                    {designSettings.watermark.enabled && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          opacity: designSettings.watermark.opacity / 100,
                          transform: "rotate(-45deg)",
                        }}
                      >
                        {designSettings.watermark.useImage && designSettings.watermark.image ? (
                          <img
                            src={designSettings.watermark.image || "/placeholder.svg"}
                            alt="Watermark"
                            style={{ maxWidth: "80px", maxHeight: "80px", objectFit: "contain" }}
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">{designSettings.watermark.text}</span>
                        )}
                      </div>
                    )}
                    {designSettings.footer.enabled && (
                      <div className="border-t pt-2 mt-4 text-center text-xs">
                        <p>{designSettings.footer.content}</p>
                        {designSettings.footer.showPageNumbers && <p>Halaman 1</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {previewMode && <FullPreview />}
    </div>
  )
}
