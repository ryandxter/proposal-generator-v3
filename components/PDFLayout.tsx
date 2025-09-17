import type React from "react"
import styles from "./PDFLayout.module.css"

interface ProposalData {
  headerContent?: string
  proposalType?: string
  recipients?: Array<{ name: string; company: string; position?: string; address?: string }>
  recipientName?: string
  recipientPosition?: string
  recipientCompany?: string
  recipientAddress?: string
  createdDate?: string
  createdBy?: string
  city?: string
  authorName?: string
  portfolioImages?: Array<{ url: string; caption?: string }>
  footerContent?: string
}

interface Template {
  type: string
  content: string
}

interface PDFLayoutProps {
  proposalData: ProposalData
  templates: Template[]
}

const PDFLayout: React.FC<PDFLayoutProps> = ({ proposalData, templates }) => {
  const getTemplateContent = (type: string) => {
    const template = templates.find((t) => t.type === type)
    return template?.content || ""
  }

  return (
    <div className={styles.pdfContainer} id="proposal-pdf">
      {/* Header */}
      <div className={styles.section}>
        <div className={styles.header}>{proposalData.headerContent || "PROPOSAL"}</div>
      </div>

      {/* Tipe Proposal */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>TIPE PROPOSAL</h2>
        <div className={styles.sectionContent}>{proposalData.proposalType}</div>
      </div>

      {/* Penerima */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>PENERIMA</h2>
        <div className={styles.sectionContent}>
          <p>Kepada Yth:</p>
          <p>{proposalData.recipientName}</p>
          <p>{proposalData.recipientPosition}</p>
          <p>{proposalData.recipientCompany}</p>
          <p>{proposalData.recipientAddress}</p>
        </div>
      </div>

      {/* Company Profile */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>PROFIL PERUSAHAAN</h2>
        <div
          className={styles.sectionContent}
          dangerouslySetInnerHTML={{ __html: getTemplateContent("company_profile") }}
        />
      </div>

      {/* Produk */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>PRODUK</h2>
        <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: getTemplateContent("product") }} />
      </div>

      {/* Keuntungan Layanan */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>KEUNTUNGAN LAYANAN</h2>
        <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: getTemplateContent("benefits") }} />
      </div>

      {/* Ketentuan Layanan */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>KETENTUAN LAYANAN</h2>
        <div className={styles.sectionContent} dangerouslySetInnerHTML={{ __html: getTemplateContent("terms") }} />
      </div>

      {/* Tanggal dan Pembuatan */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>TANGGAL DAN PEMBUATAN</h2>
        <div className={`${styles.sectionContent} ${styles.signatureSection}`}>
          <p>
            {proposalData.city || "Jakarta"},{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className={styles.signatureSpace}></div>
          <p className={styles.signatureName}>{proposalData.authorName || proposalData.createdBy}</p>
        </div>
      </div>

      {/* Portfolio */}
      {proposalData.portfolioImages && proposalData.portfolioImages.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>PORTFOLIO</h2>
          <div className={styles.portfolioGrid}>
            {proposalData.portfolioImages.map((image, index) => (
              <div key={index} className={styles.portfolioItem}>
                <img src={image.url || "/placeholder.svg"} alt={image.caption || `Portfolio ${index + 1}`} />
                {image.caption && <p className={styles.portfolioCaption}>{image.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`${styles.section} ${styles.pdfFooter}`}>
        <div className={styles.footerContent}>{proposalData.footerContent || `© ${new Date().getFullYear()}`}</div>
      </div>
    </div>
  )
}

export default PDFLayout
