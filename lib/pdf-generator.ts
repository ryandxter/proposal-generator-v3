export interface ProposalTemplate {
  id: string
  name: string
  content: string
  type: "company-profile" | "service-benefits" | "terms-conditions"
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  cogs: number
  category: string
}

export class PDFGenerator {
  static async generateProposal(
    proposalData: any,
    designSettings: any,
    templates: ProposalTemplate[],
    products: Product[],
  ) {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalData,
          designSettings,
          templates,
          products,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `proposal-${proposalData.type}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error("Error generating PDF:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  static calculateTotal(products: Product[]): { subtotal: number; total: number; totalCogs: number } {
    const subtotal = products.reduce((sum, product) => sum + product.price, 0)
    const totalCogs = products.reduce((sum, product) => sum + product.cogs, 0)
    const total = subtotal // Add tax calculation here if needed

    return { subtotal, total, totalCogs }
  }
}
