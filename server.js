import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // API Route: Create Order
  if (urlPath === '/api/create-order') {
    return createOrderHandler(req, res);
  }

  // API Route: Verify Payment Signature
  if (urlPath === '/api/verify-payment') {
    return verifyPaymentHandler(req, res);
  }

  // Health check endpoint
  if (urlPath === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', service: 'treebazzar-razorpay-api' }));
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
  console.log(`🌲 TreeBazzar Razorpay Backend running on http://localhost:${PORT}`);
  console.log(`   - POST http://localhost:${PORT}/api/create-order`);
  console.log(`   - POST http://localhost:${PORT}/api/verify-payment`);
});
