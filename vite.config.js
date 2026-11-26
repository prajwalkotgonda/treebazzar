import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'
import adPhotoHandler from './api/ad-photo.js'

function configureAdPhotoRoute(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url.split('?')[0] === '/api/ad-photo') {
      return adPhotoHandler(req, res);
    }
    next();
  });
}

function payuDevServerPlugin() {
  return {
    name: 'payu-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url.split('?')[0];

        // PayU Create Payment / Hash Generation Endpoint
        if (urlPath === '/api/payu/create-payment' || urlPath === '/api/create-order') {
          try {
            const { default: handler } = await import('./api/payu-create-payment.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Vite dev server error in /api/payu/create-payment:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // PayU Payment Verification Endpoint
        if (urlPath === '/api/payu/verify-payment' || urlPath === '/api/verify-payment') {
          try {
            const { default: handler } = await import('./api/payu-verify-payment.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Vite dev server error in /api/payu/verify-payment:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        // PayU Redirect Response Handler
        if (urlPath === '/api/payu/response') {
          try {
            const { default: handler } = await import('./api/payu-response.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Vite dev server error in /api/payu/response:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            return res.end('<h1>Payment Processing Error</h1>');
          }
        }

        // Health Check
        if (urlPath === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ status: 'ok', gateway: 'payu', mode: process.env.PAYU_ENV || 'test' }));
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    payuDevServerPlugin(),
    {
      name: 'ad-photo-api',
      configureServer: configureAdPhotoRoute,
      configurePreviewServer: configureAdPhotoRoute,
    }
  ],
  server: {
    port: 3000,
    open: false
  }
})
