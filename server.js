require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// 1. Fetch Video Info Endpoint
// 2. Secure Proxy Media Stream (Optimized for instant chunk streaming)
app.get('/api/proxy-download', async (req, res) => {
  const fileUrl = req.query.url;
  const filename = req.query.filename || 'download.mp4';

  if (!fileUrl) {
    return res.status(400).send('File URL is required');
  }

  try {
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
      maxRedirects: 10,
      timeout: 30000,
      decompress: false, // Prevents Axios from waiting to decompres bytes
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Referer': 'https://www.tiktok.com/'
      }
    });

    const safeFilename = filename.replace(/[^a-zA-Z0-9_\.-]/g, '_');

    // Transfer Content-Length if provided so browser shows download progress
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');

    // Flush headers immediately so browser triggers download save window right away
    res.flushHeaders();

    // Pipe response stream directly to Express client
    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy Error Message:', error.message);
    if (!res.headersSent) {
      res.status(500).send(`Failed to stream file: ${error.message}`);
    }
  }
});

// 2. Secure Proxy Media Stream (Fixes CORS & forces direct download)
app.get('/api/proxy-download', async (req, res) => {
  const fileUrl = req.query.url;
  const filename = req.query.filename || 'download.mp4';

  console.log("----------------------------------------");
  console.log("Incoming Download Request URL:", fileUrl);

  if (!fileUrl) {
    console.log("Error: No file URL provided");
    return res.status(400).send('File URL is required');
  }

  try {
    const parsedUrl = new URL(fileUrl);
    console.log("Parsed Domain:", parsedUrl.hostname);

    // TEMPORARY: Comment out domain validation while debugging to eliminate 403 blocks
    /*
    const allowedDomains = ['tiktokcdn.com', 'tiktokcdn-us.com', 'tiktok.com', 'byteoversea.com', 'muscdn.com', 'ibyteimg.com', 'akamaized.net'];
    const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
    if (!isAllowed) {
      console.log("Blocked by Domain Whitelist:", parsedUrl.hostname);
      return res.status(403).send('Access denied: Unauthorized media domain.');
    }
    */

    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
      maxRedirects: 10,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Referer': 'https://www.tiktok.com/'
      }
    });

    console.log("Axios Response Status:", response.status);
    console.log("Content-Type:", response.headers['content-type']);

    const safeFilename = filename.replace(/[^a-zA-Z0-9_\.-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');

    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy Error Message:', error.message);
    if (error.response) {
      console.error('API Error Response Code:', error.response.status);
    }
    if (!res.headersSent) {
      res.status(500).send(`Failed to stream file: ${error.message}`);
    }
  }
});

// Fallback for unknown API routes


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});