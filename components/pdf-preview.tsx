"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, FileText } from "lucide-react"
import { PDFGenerator } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"

interface PDFPreviewProps {
  proposalData: any
  designSettings: any
  templates?: any[]
  products?: any[]
}

export function PDFPreview({ proposalData, designSettings, templates = [], products = [] }: PDFPreviewProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const result = await PDFGenerator.generateProposal(proposalData, designSettings, templates, products)

      if (result.success) {
        toast({
          title: "PDF Berhasil Dibuat",
          description: "Dokumen proposal telah berhasil dibuat dan diunduh.",
        })
      } else {
        toast({
          title: "Gagal Membuat PDF",
          description: result.error || "Terjadi kesalahan saat membuat dokumen.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat dokumen.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Preview Dokumen
        </CardTitle>
        <CardDescription>Pratinjau dokumen proposal yang akan dibuat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Preview */}
        <div className="border rounded-lg p-6 bg-white text-black min-h-[600px] shadow-sm">
          {/* Header */}
          {designSettings.header?.enabled && (
            <div className="text-center border-b pb-4 mb-6">
              <h2 className="text-lg font-bold" style={{ color: designSettings.primaryColor }}>
                {designSettings.header.content}
              </h2>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">
              {proposalData.type === "quotation" ? "PROPOSAL PENAWARAN HARGA" : "PROPOSAL KERJASAMA"}
            </h1>
            <p className="text-sm text-gray-600">Tanggal: {proposalData.letterDate}</p>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p>Kepada Yth,</p>
            <p className="font-semibold">{proposalData.recipientName}</p>
            <p>{proposalData.recipientCompany}</p>
            <p className="text-sm">{proposalData.recipientAddress}</p>
          </div>

          {/* Opening */}
          <div className="mb-6">
            <p>Dengan hormat,</p>
            <p className="mt-2">
              Kami dari {proposalData.creatorName} bermaksud mengajukan{" "}
              {proposalData.type === "quotation" ? "penawaran harga" : "proposal kerjasama"} untuk layanan yang
              Bapak/Ibu butuhkan.
            </p>
          </div>

          {/* Service Benefits */}
          <div className="mb-6">
            <h3 className="font-bold mb-3" style={{ color: designSettings.primaryColor }}>
              KEUNTUNGAN LAYANAN KAMI
            </h3>
            <ul className="space-y-1 text-sm">
              <li>• Pengalaman lebih dari 5 tahun dalam industri</li>
              <li>• Tim profesional dan berpengalaman</li>
              <li>• Garansi kualitas dan kepuasan pelanggan</li>
              <li>• Support 24/7 untuk maintenance</li>
              <li>• Harga kompetitif dengan kualitas terbaik</li>
            </ul>
          </div>

          {/* Products/Services Table */}
          {products.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3" style={{ color: designSettings.primaryColor }}>
                RINCIAN LAYANAN
              </h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">No</th>
                    <th className="border border-gray-300 p-2 text-left">Layanan</th>
                    <th className="border border-gray-300 p-2 text-left">Deskripsi</th>
                    <th className="border border-gray-300 p-2 text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2 font-medium">{product.name}</td>
                      <td className="border border-gray-300 p-2">{product.description}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(product.price)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="border border-gray-300 p-2 text-right">
                      TOTAL
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatCurrency(products.reduce((sum, p) => sum + p.price, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h3 className="font-bold mb-3" style={{ color: designSettings.primaryColor }}>
              SYARAT DAN KETENTUAN
            </h3>
            <ol className="space-y-1 text-sm">
              <li>1. Pembayaran dilakukan secara bertahap sesuai progress pekerjaan</li>
              <li>2. Perubahan scope pekerjaan akan dikenakan biaya tambahan</li>
              <li>3. Garansi berlaku selama 1 tahun setelah serah terima</li>
              <li>4. Force majeure tidak menjadi tanggung jawab penyedia layanan</li>
            </ol>
          </div>

          {/* Closing */}
          <div className="mb-8">
            <p>Demikian proposal ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
          </div>

          {/* Signature */}
          <div>
            <p>Hormat kami,</p>
            <div className="mt-8">
              <p className="font-bold">{proposalData.creatorName}</p>
              <p>{proposalData.creatorPosition}</p>
            </div>
          </div>

          {/* Footer */}
          {designSettings.footer?.enabled && (
            <div className="border-t pt-4 mt-8 text-center text-xs text-gray-600">
              <p>{designSettings.footer.content}</p>
              {designSettings.footer.showPageNumbers && <p>Halaman 1</p>}
            </div>
          )}

          {/* Watermark */}
          {designSettings.watermark?.enabled && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: designSettings.watermark.opacity / 100,
                transform: "rotate(-45deg)",
                zIndex: 0,
              }}
            >
              <span className="text-6xl font-bold text-gray-300">{designSettings.watermark.text}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleGeneratePDF} disabled={isGenerating} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Membuat PDF..." : "Download PDF"}
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Fullscreen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
