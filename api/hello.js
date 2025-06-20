import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, voucherID, serviceType, price, duration, expiryDate, phone, address } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Replace placeholders in HTML
    let processedHtml = html
      .replace(/{{voucherID}}/g, voucherID || '#12345')
      .replace(/{{serviceType}}/g, serviceType || 'Masaż tajski klasyczny')
      .replace(/{{price}}/g, price || '220zł')
      .replace(/{{duration}}/g, duration || '60 min')
      .replace(/{{expiryDate}}/g, expiryDate || '22/05/2026')
      .replace(/{{phone}}/g, phone || '(+48) 573 994 499')
      .replace(/{{address}}/g, address || 'ul.Miodowa 21/4, Kraków');

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(processedHtml, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      width: '420px',
      height: '297px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="voucher-${voucherID || 'default'}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}
