const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const productsFilePath = path.join(__dirname, 'products.json');

// status de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const fileContent = fs.readFileSync(productsFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    res.json(data.products || []);
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ message: 'Error loading products' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});


