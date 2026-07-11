import { Injectable, Logger } from '@nestjs/common';
import { chromium, type Browser } from 'playwright';

export interface PdfGenerationOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async generatePdf(
    html: string,
    options: PdfGenerationOptions = {},
  ): Promise<Buffer> {
    const {
      format = 'A4',
      landscape = false,
      printBackground = true,
      margin = {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    } = options;

    let browser: Browser | null = null;

    try {
      browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle' });

      const pdfBuffer = await page.pdf({
        format,
        landscape,
        printBackground,
        margin,
        displayHeaderFooter: false,
      });

      await page.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
