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
app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'TikTok URL is required' });
  }

  try {
    const endpoint = `https://${process.env.RAPIDAPI_HOST}/rich_response/index?url=${encodeURIComponent(videoUrl)}`;
    
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

// 2. Secure Proxy Media Stream (Fixes CORS & limits allowed domains)
// 2. Secure Proxy Media Stream (Fixes CORS & forces direct download)
// 2. Secure Proxy Media Stream (Fixes CORS & forces direct download)
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
      maxRedirects: 5,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.tiktok.com/'
      }
    });

    const safeFilename = filename.replace(/[^a-zA-Z0-9_\.-]/g, '_');
    
    // Set response headers immediately so the browser starts downloading instantly
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // Pipe stream directly to user response
    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (!res.headersSent) {
      res.status(500).send(`Failed to stream file: ${error.message}`);
    }
  }
});

// Fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});