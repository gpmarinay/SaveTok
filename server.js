require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// 1. Fetch Video Info Endpoint
app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'TikTok URL is required' });
  }

  try {
    const endpoint = `https://${process.env.RAPIDAPI_HOST}/index?url=${encodeURIComponent(videoUrl)}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST
      },
      validateStatus: () => true
    });

    if (response.status === 429) {
      return res.status(429).json({ error: 'Daily API limit reached. Please try again later.' });
    }

    if (response.status !== 200) {
      return res.status(response.status).json({ 
        error: response.data.message || `API error (${response.status})` 
      });
    }

    return res.json(response.data);

  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Proxy Media Stream Endpoint
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
      decompress: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Referer': 'https://www.tiktok.com/'
      }
    });

    const safeFilename = filename.replace(/[^a-zA-Z0-9_\.-]/g, '_');

    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');

    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (!res.headersSent) {
      res.status(500).send(`Failed to stream file: ${error.message}`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});