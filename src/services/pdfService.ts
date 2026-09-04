import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'pt' | 'in';
  marginMm?: number;
}

/**
 * Resolves modern CSS color functions (oklch, oklab, color-mix, etc.) to standard rgb/rgba strings
 * so that html2canvas can parse them without throwing "unsupported color function" errors.
 */
function resolveColorToRgb(colorStr: string): string {
  try {
    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.style.color = '#000000';
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
    if (computed && !computed.includes('oklch') && !computed.includes('oklab') && !computed.includes('color-mix')) {
      return computed;
    }
  } catch {
    // fallback below
  }

  // Fallback heuristics for common Tailwind palette cues if browser didn't convert
  const lower = colorStr.toLowerCase();
  if (lower.includes('white')) return '#ffffff';
  if (lower.includes('black')) return '#000000';
  if (lower.includes('emerald') || lower.includes('green')) return '#059669';
  if (lower.includes('amber') || lower.includes('yellow')) return '#d97706';
  if (lower.includes('blue')) return '#2563eb';
  if (lower.includes('rose') || lower.includes('red')) return '#e11d48';
  if (lower.includes('slate') || lower.includes('gray')) return '#334155';
  return '#1e293b';
}

/**
 * Sanitizes an HTML document clone by replacing all unsupported modern color spaces in <style> tags and inline styles.
 */
function sanitizeClonedDocColors(clonedDoc: Document): void {
  const modernColorRegex = /(?:oklch|oklab|lch|lab|color-mix|color)\([^)]+\)/gi;

  // 1. Sanitize all <style> elements (including Tailwind v4 theme variables)
  const styleTags = clonedDoc.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    if (styleTag.textContent && modernColorRegex.test(styleTag.textContent)) {
      styleTag.textContent = styleTag.textContent.replace(modernColorRegex, (match) => {
        return resolveColorToRgb(match);
      });
    }
  });

  // 2. Sanitize inline styles on all elements
  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    if (el.style) {
      for (let i = 0; i < el.style.length; i++) {
        const prop = el.style[i];
        const val = el.style.getPropertyValue(prop);
        if (val && modernColorRegex.test(val)) {
          el.style.setProperty(prop, val.replace(modernColorRegex, (m) => resolveColorToRgb(m)));
        }
      }
    }
  });
}

export class PDFService {
  /**
   * Generates and downloads a high-quality PDF file from an HTML element
   */
  static async exportToPDF(
    elementOrId: HTMLElement | string,
    options: PDFExportOptions = {}
  ): Promise<boolean> {
    const {
      filename = 'Dokumen_Sekolah.pdf',
      orientation = 'portrait',
      marginMm = 10
    } = options;

    const targetElement: HTMLElement | null =
      typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!targetElement) {
      console.error('Target element for PDF generation not found:', elementOrId);
      return false;
    }

    try {
      const originalScrollPos = window.scrollY;

      // Render to canvas with html2canvas with sanitized styles
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Sanitize oklch and modern colors to prevent parser errors
          sanitizeClonedDocColors(clonedDoc);

          const clonedTarget = typeof elementOrId === 'string'
            ? clonedDoc.getElementById(elementOrId)
            : clonedDoc.querySelector(`[data-print-target]`) as HTMLElement;

          if (clonedTarget) {
            clonedTarget.style.display = 'block';
            clonedTarget.style.background = '#ffffff';
            clonedTarget.style.color = '#000000';
            clonedTarget.style.padding = '12px';
            clonedTarget.style.maxWidth = '100%';
            clonedTarget.style.boxShadow = 'none';
            clonedTarget.style.border = 'none';
          }
        }
      });

      window.scrollTo(0, originalScrollPos);

      // Setup jsPDF in A4
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = orientation === 'portrait' ? 210 : 297;
      const pageHeight = orientation === 'portrait' ? 297 : 210;
      const printableWidth = pageWidth - (marginMm * 2);
      const printableHeight = pageHeight - (marginMm * 2);

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginMm;

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add first page
      pdf.addImage(imgData, 'PNG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= printableHeight;

      // If content spans across multiple pages, slice smoothly
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + marginMm;
        pdf.addPage('a4', orientation);
        pdf.addImage(imgData, 'PNG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= printableHeight;
      }

      // Save PDF file
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return true;
    } catch (err) {
      console.error('Error generating PDF with jsPDF:', err);
      // Fallback: try clean iframe print
      this.printCleanly(targetElement, filename);
      return false;
    }
  }

  /**
   * Opens an isolated, clean print dialog via a hidden iframe to prevent modal backdrop or styling cuts
   */
  static printCleanly(elementOrId: HTMLElement | string, docTitle: string = 'Dokumen Cetak'): boolean {
    const targetElement: HTMLElement | null =
      typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!targetElement) {
      window.print();
      return false;
    }

    try {
      // Create hidden printable iframe
      const iframeId = 'print-engine-iframe';
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        window.print();
        return false;
      }

      // Collect head styles and sanitize them
      const modernColorRegex = /(?:oklch|oklab|lch|lab|color-mix|color)\([^)]+\)/gi;
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => {
          let html = el.outerHTML;
          if (modernColorRegex.test(html)) {
            html = html.replace(modernColorRegex, (m) => resolveColorToRgb(m));
          }
          return html;
        })
        .join('\n');

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>${docTitle}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 1.2cm 1.5cm 1.5cm 1.5cm;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 10px !important;
              font-family: serif !important;
              font-size: 11pt !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th, td {
              border: 1px solid #111827 !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div>
            ${targetElement.innerHTML}
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed, falling back to window.print', e);
          window.print();
        }
      }, 400);

      return true;
    } catch (e) {
      console.warn('Print cleanly exception:', e);
      window.print();
      return false;
    }
  }
}
