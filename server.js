import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import createPaymentHandler from './api/payu-create-payment.js';
import verifyPaymentHandler from './api/payu-verify-payment.js';
import payuResponseHandler from './api/payu-response.js';
import adPhotoHandler from './api/ad-photo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/api/ad-photo') {
    return adPhotoHandler(req, res);
  }

  // API Route: Create PayU Payment / Order
  if (urlPath === '/api/payu/create-payment' || urlPath === '/api/create-order') {
    return createPaymentHandler(req, res);
  }

  // API Route: Verify PayU Payment Signature / Hash
  if (urlPath === '/api/payu/verify-payment' || urlPath === '/api/verify-payment') {
    return verifyPaymentHandler(req, res);
  }

  // API Route: PayU Browser Redirect Handler
  if (urlPath === '/api/payu/response') {
    return payuResponseHandler(req, res);
  }

  // Health check endpoint
  if (urlPath === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'treebazzar-payu-api',
      mode: process.env.PAYU_ENV || 'test',
      merchantKey: process.env.PAYU_MERCHANT_KEY ? 'Configured (UR9xGD)' : 'Missing'
    }));
  }

  // Static File Serving (from dist if built)
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    let filePath = path.join(distPath, urlPath === '/' ? 'index.html' : urlPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distPath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    } catch (err) {
      // fallback
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🌲 TreeBazzar PayU Backend running on http://localhost:${PORT}`);
  console.log(`   - POST http://localhost:${PORT}/api/payu/create-payment`);
  console.log(`   - POST http://localhost:${PORT}/api/payu/verify-payment`);
  console.log(`   - PayU Key: ${process.env.PAYU_MERCHANT_KEY || 'UR9xGD'} (${process.env.PAYU_ENV || 'test'} mode)`);
});
