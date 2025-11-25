const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_API = process.env.FLASK_API || 'http://localhost:5000';

// Serve static files from public directory
app.use(express.static('public'));

// Proxy route to Flask backend
app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Flask:', error);
    res.status(500).json({ error: 'Failed to fetch data from backend' });
  }
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Proxying to Flask backend at: ${FLASK_API}`);
});
