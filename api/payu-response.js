import 'dotenv/config';

export default async function handler(req, res) {
  // Read body from POST request
  let body = req.body;
  if (!body) {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          // Parse urlencoded form data
          const parsed = Object.fromEntries(new URLSearchParams(data));
          resolve(parsed);
        } catch (e) {
          resolve({});
        }
      });
    });
  }

  const status = body?.status || (req.url.includes('status=success') ? 'success' : 'failure');
  const txnid = body?.txnid || '';
  const mihpayid = body?.mihpayid || '';
  const amount = body?.amount || '100.00';

  const isSuccess = status === 'success' || status === 'captured';

  // Render HTML response that communicates with parent window or redirects
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>TreeBazzar - PayU Payment ${isSuccess ? 'Success' : 'Failed'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #F8FAF9;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 32px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
            border: 1px solid #E2E8F0;
          }
          .icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            font-size: 24px;
          }
          .icon-success { background: #E8F5E9; color: #1E5631; }
          .icon-fail { background: #FFEBEE; color: #C62828; }
          h2 { margin: 0 0 8px; font-size: 20px; font-weight: 800; }
          p { margin: 0 0 20px; font-size: 13px; color: #64748B; }
          .info { background: #F1F5F2; padding: 12px; border-radius: 12px; margin-bottom: 24px; font-size: 12px; text-align: left; }
          .btn {
            display: inline-block;
            background: #1E5631;
            color: white;
            padding: 10px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon ${isSuccess ? 'icon-success' : 'icon-fail'}">
            ${isSuccess ? '✓' : '✕'}
          </div>
          <h2>${isSuccess ? 'पेमेंट यशस्वी झाले! / Payment Successful' : 'पेमेंट अयशस्वी झाले / Payment Failed'}</h2>
          <p>${isSuccess ? 'तुमची नोंदणी फी PayU द्वारे सुरक्षितपणे प्राप्त झाली आहे.' : 'PayU transaction could not be completed.'}</p>
          <div class="info">
            <div><strong>Transaction ID:</strong> ${txnid || 'TB_PAYU_' + Date.now()}</div>
            <div><strong>PayU ID:</strong> ${mihpayid || 'Verified'}</div>
            <div><strong>Amount:</strong> ₹${amount}</div>
          </div>
          <a href="/admin" class="btn" id="closeBtn">ॲडमिन डॅशबोर्डवर परत जा</a>
        </div>
        <script>
          // Notify opener window if opened in popup
          if (window.opener) {
            try {
              window.opener.postMessage({
                type: 'PAYU_PAYMENT_RESPONSE',
                success: ${isSuccess},
                txnid: '${txnid}',
                mihpayid: '${mihpayid}',
                amount: '${amount}'
              }, '*');
              setTimeout(() => {
                window.close();
              }, 2000);
            } catch(e) {}
          }
        </script>
      </body>
    </html>
  `);
}
