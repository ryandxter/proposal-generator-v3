import type { jsPDF } from "jspdf"

interface TextStyle {
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: number
  color: string
}

interface TextElement {
  text: string
  style: TextStyle
  isNewLine?: boolean
  isList?: boolean
  listType?: "ul" | "ol"
  listIndex?: number
  alignment?: "left" | "center" | "right"
}

export class HTMLToPDFConverter {
  private doc: jsPDF
  private defaultStyle: TextStyle
  private pageWidth: number
  private margins: { left: number; right: number }

  constructor(doc: jsPDF, margins: { left: number; right: number }) {
    this.doc = doc
    this.margins = margins
    this.pageWidth = doc.internal.pageSize.getWidth() - margins.left - margins.right
    this.defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 12,
      color: "#000000",
    }
  }

  parseHTML(html: string): TextElement[] {
    const elements: TextElement[] = []

    if (!html || html.trim() === "") {
      return elements
    }

    // Remove HTML tags and extract text with basic formatting
    let processedHtml = html

    // Handle headings
    processedHtml = processedHtml.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
      const size = this.getHeadingSize(`h${level}`)
      elements.push({
        text: this.stripTags(content),
        style: { ...this.defaultStyle, fontSize: size, bold: true },
        isNewLine: true,
      })
      return ""
    })

    // Handle paragraphs
    processedHtml = processedHtml.replace(/<p[^>]*>(.*?)<\/p>/gi, (match, content) => {
      if (content.trim()) {
        elements.push({
          text: this.stripTags(content),
          style: { ...this.defaultStyle },
          isNewLine: true,
        })
      }
      return ""
    })

    // Handle line breaks
    processedHtml = processedHtml.replace(/<br\s*\/?>/gi, () => {
      elements.push({
        text: "",
        style: { ...this.defaultStyle },
        isNewLine: true,
      })
      return ""
    })

    // Handle unordered lists
    processedHtml = processedHtml.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi)
      if (listItems) {
        listItems.forEach((item: string, index: number) => {
          const text = this.stripTags(item.replace(/<\/?li[^>]*>/gi, ""))
          if (text.trim()) {
            elements.push({
              text: `• ${text}`,
              style: { ...this.defaultStyle },
              isNewLine: true,
            })
          }
        })
      }
      return ""
    })

    // Handle ordered lists
    processedHtml = processedHtml.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi)
      if (listItems) {
        listItems.forEach((item: string, index: number) => {
          const text = this.stripTags(item.replace(/<\/?li[^>]*>/gi, ""))
          if (text.trim()) {
            elements.push({
              text: `${index + 1}. ${text}`,
              style: { ...this.defaultStyle },
              isNewLine: true,
            })
          }
        })
      }
      return ""
    })

    // Handle bold text
    processedHtml = processedHtml.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, (match, tag, content) => {
      elements.push({
        text: this.stripTags(content),
        style: { ...this.defaultStyle, bold: true },
      })
      return ""
    })

    // Handle italic text
    processedHtml = processedHtml.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, (match, tag, content) => {
      elements.push({
        text: this.stripTags(content),
        style: { ...this.defaultStyle, italic: true },
      })
      return ""
    })

    // Handle remaining text
    const remainingText = this.stripTags(processedHtml).trim()
    if (remainingText) {
      elements.push({
        text: remainingText,
        style: { ...this.defaultStyle },
      })
    }

    return elements
  }

  private stripTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  }

  private getHeadingSize(tag: string): number {
    const sizes = {
      h1: 18,
      h2: 16,
      h3: 14,
      h4: 13,
      h5: 12,
      h6: 11,
    }
    return sizes[tag as keyof typeof sizes] || 12
  }

  renderToPDF(elements: TextElement[], startY: number): number {
    let yPosition = startY
    const lineHeight = 6

    for (const element of elements) {
      // Apply text style
      this.applyTextStyle(element.style)

      if (element.isNewLine && !element.text) {
        yPosition += lineHeight
        continue
      }

      if (element.text) {
        // Split text to fit page width
        const lines = this.doc.splitTextToSize(element.text, this.pageWidth)

        for (const line of lines) {
          this.doc.text(line, this.margins.left, yPosition)
          yPosition += lineHeight
        }

        if (element.isNewLine) {
          yPosition += lineHeight * 0.5 // Add extra space after paragraphs
        }
      }
    }

    return yPosition
  }

  private applyTextStyle(style: TextStyle) {
    // Set font style
    let fontStyle = "normal"
    if (style.bold && style.italic) {
      fontStyle = "bolditalic"
    } else if (style.bold) {
      fontStyle = "bold"
    } else if (style.italic) {
      fontStyle = "italic"
    }

    this.doc.setFont("helvetica", fontStyle)
    this.doc.setFontSize(style.fontSize)

    // Convert hex color to RGB
    const color = this.hexToRgb(style.color)
    if (color) {
      this.doc.setTextColor(color.r, color.g, color.b)
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }
}

export function renderHTMLContent(
  doc: jsPDF,
  htmlContent: string,
  startY: number,
  margins: { left: number; right: number },
): number {
  if (!htmlContent || htmlContent.trim() === "") {
    return startY
  }

  try {
    const converter = new HTMLToPDFConverter(doc, margins)
    const elements = converter.parseHTML(htmlContent)
    return converter.renderToPDF(elements, startY)
  } catch (error) {
    console.error("[v0] Error parsing HTML content:", error)
    // Fallback to plain text rendering
    const lines = doc.splitTextToSize(htmlContent, margins.right - margins.left)
    doc.text(lines, margins.left, startY)
    return startY + lines.length * 6
  }
}
