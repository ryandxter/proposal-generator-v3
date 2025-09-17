"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Trash2, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Portfolio {
  id: string
  name: string
  description: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadDate: Date
}

export default function PortfolioPage() {
  const { toast } = useToast()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: "1",
      name: "Company Portfolio 2024",
      description: "Portfolio lengkap perusahaan tahun 2024",
      fileName: "company-portfolio-2024.pdf",
      fileUrl: "/placeholder-portfolio.pdf",
      fileSize: 2048000, // 2MB
      uploadDate: new Date("2024-01-15"),
    },
  ])
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Hanya file PDF yang diperbolehkan",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast({
        title: "Error",
        description: "Ukuran file maksimal 10MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulate file upload to blob storage
      // In real implementation, this would upload to Vercel Blob or similar service
      const fileUrl = URL.createObjectURL(file)

      const newPortfolio: Portfolio = {
        id: Date.now().toString(),
        name: file.name.replace(".pdf", ""),
        description: "",
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        uploadDate: new Date(),
      }

      setPortfolios([...portfolios, newPortfolio])
      setEditingPortfolio(newPortfolio)

      toast({
        title: "Berhasil",
        description: "File portfolio berhasil diupload",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    if (editingPortfolio) {
      setPortfolios(portfolios.map((p) => (p.id === editingPortfolio.id ? editingPortfolio : p)))
      setEditingPortfolio(null)
      toast({
        title: "Berhasil",
        description: "Portfolio berhasil disimpan",
      })
    }
  }

  const handleDelete = (id: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== id))
    if (editingPortfolio?.id === id) {
      setEditingPortfolio(null)
    }
    toast({
      title: "Berhasil",
      description: "Portfolio berhasil dihapus",
    })
  }

  const handlePreview = (portfolio: Portfolio) => {
    window.open(portfolio.fileUrl, "_blank")
  }

  const handleDownload = (portfolio: Portfolio) => {
    const link = document.createElement("a")
    link.href = portfolio.fileUrl
    link.download = portfolio.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Kelola file portfolio perusahaan (PDF)</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Portfolio</CardTitle>
            <CardDescription>File portfolio yang tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag & drop file PDF atau klik untuk upload</p>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="portfolio-upload"
              />
              <Label htmlFor="portfolio-upload">
                <Button variant="outline" disabled={isUploading} asChild>
                  <span>{isUploading ? "Mengupload..." : "Pilih File PDF"}</span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">Maksimal 10MB, format PDF</p>
            </div>

            {/* Portfolio List */}
            <div className="space-y-2">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{portfolio.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(portfolio.fileSize)} • {portfolio.uploadDate.toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(portfolio)} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(portfolio)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPortfolio(portfolio)} title="Edit">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(portfolio.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        {editingPortfolio && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Portfolio</CardTitle>
              <CardDescription>Edit informasi portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolio-name">Nama Portfolio</Label>
                <Input
                  id="portfolio-name"
                  value={editingPortfolio.name}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="portfolio-description">Deskripsi</Label>
                <Textarea
                  id="portfolio-description"
                  rows={4}
                  value={editingPortfolio.description}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, description: e.target.value })}
                  placeholder="Deskripsi portfolio..."
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Informasi File</p>
                <p className="text-sm text-muted-foreground">Nama File: {editingPortfolio.fileName}</p>
                <p className="text-sm text-muted-foreground">Ukuran: {formatFileSize(editingPortfolio.fileSize)}</p>
                <p className="text-sm text-muted-foreground">
                  Upload: {editingPortfolio.uploadDate.toLocaleDateString("id-ID")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setEditingPortfolio(null)}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
