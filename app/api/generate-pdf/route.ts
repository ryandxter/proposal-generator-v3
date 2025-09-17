import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import { renderHTMLContent } from "@/utils/htmlToPdf"

interface ProposalData {
  type: "quotation" | "partnership"
  recipientName: string
  recipientCompany: string
  recipientAddress: string
  serviceBenefitsTemplate: string
  termsConditionsTemplate: string
  letterDate: string
  creatorName: string
  creatorPosition: string
  selectedProducts: string[]
  companyProfileContent?: string
  serviceBenefitsContent?: string
  termsConditionsContent?: string
  products?: any[]
}

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
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting PDF generation")

    const {
      proposalData,
      designSettings,
      templates,
      products,
    }: {
      proposalData: ProposalData
      designSettings: DesignSettings
      templates?: any
      products?: any[]
    } = await request.json()

    console.log("[v0] Received proposal data:", {
      type: proposalData.type,
      hasCompanyProfile: !!proposalData.companyProfileContent,
      hasServiceBenefits: !!proposalData.serviceBenefitsContent,
      hasTermsConditions: !!proposalData.termsConditionsContent,
    })

    // Create new PDF document with design settings
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: designSettings.pageSize.toLowerCase() as "a4" | "letter" | "legal",
    })

    console.log("[v0] Created PDF document")

    // Apply design settings
    doc.setFont("helvetica")
    doc.setFontSize(designSettings.fontSize)

    const { margins } = designSettings
    let yPosition = margins.top

    if (designSettings.header?.enabled) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(designSettings.primaryColor)
      doc.text(designSettings.header.content, doc.internal.pageSize.getWidth() / 2, yPosition, {
        align: "center",
      })
      yPosition += designSettings.header.height
    }

    if (designSettings.watermark?.enabled) {
      doc.setGState(new doc.GState({ opacity: designSettings.watermark.opacity / 100 }))
      doc.setFontSize(48)
      doc.setTextColor(200, 200, 200)
      doc.text(
        designSettings.watermark.text,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() / 2,
        {
          align: "center",
          angle: 45,
        },
      )
      doc.setGState(new doc.GState({ opacity: 1 }))
    }

    // Reset font settings for content
    doc.setFontSize(designSettings.fontSize)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    if (proposalData.companyProfileContent) {
      console.log("[v0] Rendering company profile content")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(designSettings.primaryColor)
      doc.text("PROFIL PERUSAHAAN", margins.left, yPosition)
      yPosition += 10

      // Reset to normal style before rendering HTML content
      doc.setFont("helvetica", "normal")
      doc.setFontSize(designSettings.fontSize)
      doc.setTextColor(0, 0, 0)

      try {
        yPosition = renderHTMLContent(doc, proposalData.companyProfileContent, yPosition, margins)
      } catch (error) {
        console.error("[v0] Error rendering company profile:", error)
        // Fallback to plain text
        const lines = doc.splitTextToSize(proposalData.companyProfileContent, 160)
        doc.text(lines, margins.left, yPosition)
        yPosition += lines.length * 6
      }
      yPosition += 15
    }

    // Add proposal title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(designSettings.primaryColor)
    const proposalTitle = proposalData.type === "quotation" ? "PROPOSAL PENAWARAN HARGA" : "PROPOSAL KERJASAMA"
    doc.text(proposalTitle, margins.left, yPosition)
    yPosition += 15

    // Add date
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Tanggal: ${proposalData.letterDate}`, margins.left, yPosition)
    yPosition += 10

    // Add recipient information
    doc.text("Kepada Yth,", margins.left, yPosition)
    yPosition += 6
    doc.setFont("helvetica", "bold")
    doc.text(proposalData.recipientName, margins.left, yPosition)
    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.text(proposalData.recipientCompany, margins.left, yPosition)
    yPosition += 6

    // Split address into multiple lines if needed
    const addressLines = doc.splitTextToSize(proposalData.recipientAddress, 150)
    doc.text(addressLines, margins.left, yPosition)
    yPosition += addressLines.length * 6 + 10

    // Add greeting
    doc.text("Dengan hormat,", margins.left, yPosition)
    yPosition += 10

    // Add opening paragraph
    const openingText = `Kami dari ${proposalData.creatorName} bermaksud mengajukan ${
      proposalData.type === "quotation" ? "penawaran harga" : "proposal kerjasama"
    } untuk layanan yang Bapak/Ibu butuhkan.`
    const openingLines = doc.splitTextToSize(openingText, 160)
    doc.text(openingLines, margins.left, yPosition)
    yPosition += openingLines.length * 6 + 15

    if (proposalData.serviceBenefitsContent) {
      console.log("[v0] Rendering service benefits content")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(designSettings.primaryColor)
      doc.text("KEUNTUNGAN LAYANAN KAMI", margins.left, yPosition)
      yPosition += 10

      // Reset to normal style before rendering HTML content
      doc.setFont("helvetica", "normal")
      doc.setFontSize(designSettings.fontSize)
      doc.setTextColor(0, 0, 0)

      try {
        yPosition = renderHTMLContent(doc, proposalData.serviceBenefitsContent, yPosition, margins)
      } catch (error) {
        console.error("[v0] Error rendering service benefits:", error)
        // Fallback to plain text
        const lines = doc.splitTextToSize(proposalData.serviceBenefitsContent, 160)
        doc.text(lines, margins.left, yPosition)
        yPosition += lines.length * 6
      }
      yPosition += 15
    }

    if (proposalData.products && proposalData.products.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(designSettings.primaryColor)
      doc.text("RINCIAN LAYANAN", margins.left, yPosition)
      yPosition += 10

      // Create table headers
      const tableStartY = yPosition
      const colWidths = [15, 60, 80, 35]
      const colPositions = [margins.left, margins.left + 15, margins.left + 75, margins.left + 155]

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("No", colPositions[0], yPosition)
      doc.text("Layanan", colPositions[1], yPosition)
      doc.text("Deskripsi", colPositions[2], yPosition)
      doc.text("Harga", colPositions[3], yPosition)
      yPosition += 8

      // Add table content
      doc.setFont("helvetica", "normal")
      proposalData.products.forEach((product: any, index: number) => {
        doc.text((index + 1).toString(), colPositions[0], yPosition)
        doc.text(product.name, colPositions[1], yPosition)

        const descLines = doc.splitTextToSize(product.description, 75)
        doc.text(descLines, colPositions[2], yPosition)

        const formattedPrice = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(product.price)
        doc.text(formattedPrice, colPositions[3], yPosition, { align: "right" })

        yPosition += Math.max(8, descLines.length * 4 + 4)
      })

      // Add total
      const total = proposalData.products.reduce((sum: number, p: any) => sum + p.price, 0)
      const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(total)

      yPosition += 5
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL", colPositions[2], yPosition, { align: "right" })
      doc.text(formattedTotal, colPositions[3], yPosition, { align: "right" })
      yPosition += 15
    }

    if (proposalData.termsConditionsContent) {
      console.log("[v0] Rendering terms and conditions content")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(designSettings.primaryColor)
      doc.text("SYARAT DAN KETENTUAN", margins.left, yPosition)
      yPosition += 10

      // Reset to normal style before rendering HTML content
      doc.setFont("helvetica", "normal")
      doc.setFontSize(designSettings.fontSize)
      doc.setTextColor(0, 0, 0)

      try {
        yPosition = renderHTMLContent(doc, proposalData.termsConditionsContent, yPosition, margins)
      } catch (error) {
        console.error("[v0] Error rendering terms and conditions:", error)
        // Fallback to plain text
        const lines = doc.splitTextToSize(proposalData.termsConditionsContent, 160)
        doc.text(lines, margins.left, yPosition)
        yPosition += lines.length * 6
      }
      yPosition += 15
    }

    // Add closing
    doc.text("Demikian proposal ini kami sampaikan. Atas perhatian dan kerjasamanya,", margins.left, yPosition)
    yPosition += 6
    doc.text("kami ucapkan terima kasih.", margins.left, yPosition)
    yPosition += 20

    // Add signature
    doc.text("Hormat kami,", margins.left, yPosition)
    yPosition += 20
    doc.setFont("helvetica", "bold")
    doc.text(proposalData.creatorName, margins.left, yPosition)
    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.text(proposalData.creatorPosition, margins.left, yPosition)

    if (designSettings.footer?.enabled) {
      const pageHeight = doc.internal.pageSize.getHeight()
      let footerY = pageHeight - margins.bottom

      if (designSettings.footer.showPageNumbers) {
        doc.text("Halaman 1", doc.internal.pageSize.getWidth() - margins.right, footerY, { align: "right" })
        footerY -= 6
      }

      doc.setFontSize(10)
      doc.setTextColor(designSettings.secondaryColor)
      doc.text(designSettings.footer.content, doc.internal.pageSize.getWidth() / 2, footerY, { align: "center" })
    }

    console.log("[v0] Generating PDF buffer")
    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    console.log("[v0] PDF generated successfully")
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${proposalData.type}-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF", details: error.message }, { status: 500 })
  }
}
