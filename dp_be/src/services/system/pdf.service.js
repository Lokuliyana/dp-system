const puppeteer = require('puppeteer-core');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

/**
 * Service to handle high-precision PDF generation
 * using EJS templates and Puppeteer.
 */
class PdfService {
  constructor() {
    this.browser = null;
    this.chromePath = this.getExecutablePath();
  }

  getExecutablePath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
    if (process.env.CHROME_BIN) return process.env.CHROME_BIN;

    if (process.platform === 'darwin') {
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (process.platform === 'win32') {
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // fallback for windows
    } else {
      // Common paths for Linux
      const paths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ];
      for (const p of paths) {
        if (fs.existsSync(p)) return p;
      }
      return '/usr/bin/google-chrome'; // Default fallback
    }
  }

  /**
   * Initialize browser instance
   */
  async init() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          executablePath: this.chromePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      } catch (err) {
        console.error('Failed to launch Puppeteer:', err);
        throw new Error('PDF Generation Engine Error: Could not launch local browser. Please ensure Google Chrome is installed.');
      }
    }
  }

  /**
   * Generate PDF from EJS template
   * @param {string} templateName - Name of the template in src/templates/pdf/
   * @param {object} data - Data to pass to EJS
   * @param {object} options - Puppeteer PDF options
   */
  async generatePdf(templateName, data, options = {}) {
    await this.init();

    const templatePath = path.join(__dirname, '../../templates/pdf', `${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found at ${templatePath}`);
    }

    // Render EJS
    const html = await ejs.renderFile(templatePath, {
      ...data,
      // Helper for formatting dates or currency if needed
      formatDate: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    });

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Default PDF options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
        ...options,
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  /**
   * Close browser on app shutdown
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PdfService();
