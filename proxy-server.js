const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: 'https://construct.velandev.in',
  changeOrigin: true,
  secure: true,
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});