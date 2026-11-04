import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

function razorpayDevServerPlugin() {
  return {
    name: 'razorpay-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url.split('?')[0];
        if (urlPath === '/api/create-order') {
          try {
            const { default: handler } = await import('./api/create-order.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Vite dev server error in /api/create-order:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }
        if (urlPath === '/api/verify-payment') {
          try {
            const { default: handler } = await import('./api/verify-payment.js');
            return await handler(req, res);
          } catch (err) {
            console.error('Vite dev server error in /api/verify-payment:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), razorpayDevServerPlugin()],
  server: {
    port: 3000,
    open: false
  }
})
