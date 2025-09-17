import html2pdf from "html2pdf.js"

export interface ProposalData {
  headerText?: string
  proposalType?: string
  recipientName?: string
  recipientPosition?: string
  recipientCompany?: string
  recipientAddress?: string
  city?: string
  authorName?: string
  footerText?: string
  portfolioImages?: Array<{ url: string; caption?: string }>
}

export interface Template {
  type: string
  content: string
}

export const generateProposalFromHTML = async (proposalData: ProposalData, templates: Template[]) => {
  // Create container div
  const container = document.createElement("div")
  container.className = "pdf-container"
  container.style.cssText = `
    max-width: 210mm;
    margin: 0 auto;
    padding: 20mm;
    background: white;
    color: black;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
  `

  // Add header
  const header = document.createElement("div")
  header.className = "pdf-header"
  header.style.cssText = `
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 30px;
    padding-bottom: 10px;
    border-bottom: 2px solid #333;
  `
  header.innerHTML = `<h1>${proposalData.headerText || "PROPOSAL"}</h1>`
  container.appendChild(header)

  // Add proposal type
  const proposalType = document.createElement("div")
  proposalType.className = "pdf-section"
  proposalType.style.cssText = "margin-bottom: 20px;"
  proposalType.innerHTML = `<h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">${proposalData.proposalType || "PROPOSAL"}</h2>`
  container.appendChild(proposalType)

  // Add recipient
  const recipient = document.createElement("div")
  recipient.className = "pdf-section"
  recipient.style.cssText = "margin-bottom: 20px;"
  recipient.innerHTML = `
    <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PENERIMA</h2>
    <div style="margin-bottom: 15px; text-align: justify;">
      <p>Kepada Yth:</p>
      <p>${proposalData.recipientName || ""}</p>
      <p>${proposalData.recipientPosition || ""}</p>
      <p>${proposalData.recipientCompany || ""}</p>
      <p>${proposalData.recipientAddress || ""}</p>
    </div>
  `
  container.appendChild(recipient)

  // Add company profile
  const companyProfileTemplate = templates.find((t) => t.type === "company_profile")
  if (companyProfileTemplate?.content) {
    const companyProfile = document.createElement("div")
    companyProfile.className = "pdf-section"
    companyProfile.style.cssText = "margin-bottom: 20px;"
    companyProfile.innerHTML = `
      <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PROFIL PERUSAHAAN</h2>
      <div style="margin-bottom: 15px; text-align: justify;">${companyProfileTemplate.content}</div>
    `
    container.appendChild(companyProfile)
  }

  // Add products
  const productTemplate = templates.find((t) => t.type === "product")
  if (productTemplate?.content) {
    const product = document.createElement("div")
    product.className = "pdf-section"
    product.style.cssText = "margin-bottom: 20px;"
    product.innerHTML = `
      <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PRODUK</h2>
      <div style="margin-bottom: 15px; text-align: justify;">${productTemplate.content}</div>
    `
    container.appendChild(product)
  }

  // Add service benefits
  const benefitsTemplate = templates.find((t) => t.type === "benefits")
  if (benefitsTemplate?.content) {
    const benefits = document.createElement("div")
    benefits.className = "pdf-section"
    benefits.style.cssText = "margin-bottom: 20px;"
    benefits.innerHTML = `
      <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">KEUNTUNGAN LAYANAN</h2>
      <div style="margin-bottom: 15px; text-align: justify;">${benefitsTemplate.content}</div>
    `
    container.appendChild(benefits)
  }

  // Add service terms
  const termsTemplate = templates.find((t) => t.type === "terms")
  if (termsTemplate?.content) {
    const terms = document.createElement("div")
    terms.className = "pdf-section"
    terms.style.cssText = "margin-bottom: 20px;"
    terms.innerHTML = `
      <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">KETENTUAN LAYANAN</h2>
      <div style="margin-bottom: 15px; text-align: justify;">${termsTemplate.content}</div>
    `
    container.appendChild(terms)
  }

  // Add date and signature
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const signature = document.createElement("div")
  signature.className = "pdf-section pdf-signature"
  signature.style.cssText = "margin-top: 40px; page-break-inside: avoid;"
  signature.innerHTML = `
    <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">TANGGAL DAN PEMBUATAN</h2>
    <div style="margin-bottom: 15px;">
      <p>${proposalData.city || "Jakarta"}, ${currentDate}</p>
      <div style="height: 60px; margin: 20px 0;"></div>
      <p style="font-weight: bold; text-decoration: underline;">${proposalData.authorName || ""}</p>
    </div>
  `
  container.appendChild(signature)

  // Add portfolio if available
  if (proposalData.portfolioImages && proposalData.portfolioImages.length > 0) {
    const portfolio = document.createElement("div")
    portfolio.className = "pdf-section"
    portfolio.style.cssText = "margin-bottom: 20px; page-break-inside: avoid;"
    portfolio.innerHTML =
      '<h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; color: #333; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PORTFOLIO</h2>'

    const portfolioGrid = document.createElement("div")
    portfolioGrid.style.cssText =
      "display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;"

    proposalData.portfolioImages.forEach((img) => {
      const imgContainer = document.createElement("div")
      imgContainer.style.cssText = "text-align: center;"
      imgContainer.innerHTML = `
        <img src="${img.url}" alt="${img.caption || "Portfolio item"}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
        ${img.caption ? `<p style="font-size: 10pt; color: #666; margin-top: 5px; font-style: italic;">${img.caption}</p>` : ""}
      `
      portfolioGrid.appendChild(imgContainer)
    })

    portfolio.appendChild(portfolioGrid)
    container.appendChild(portfolio)
  }

  // Add footer
  const footer = document.createElement("div")
  footer.className = "pdf-footer"
  footer.style.cssText =
    "margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 10pt; color: #666;"
  footer.innerHTML = `<p>${proposalData.footerText || "© " + new Date().getFullYear()}</p>`
  container.appendChild(footer)

  // Add the container to the document temporarily
  document.body.appendChild(container)

  // PDF generation options
  const options = {
    margin: [15, 15, 15, 15],
    filename: `proposal_${new Date().getTime()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  }

  try {
    const pdf = await html2pdf().from(container).set(options).save()
    document.body.removeChild(container)
    return pdf
  } catch (error) {
    document.body.removeChild(container)
    throw error
  }
}
