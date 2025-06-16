export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
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

    // For now, return processed HTML to test
    res.setHeader('Content-Type', 'text/html');
    res.send(processedHtml);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
