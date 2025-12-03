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

const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVIDOR API INICIADO');
  console.log('='.repeat(60));
  console.log(`📍 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Red:      http://${ip}:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n📱 Para usar en dispositivo móvil:');
  console.log(`   Actualiza src/environments/environment.ts con:`);
  console.log(`   apiBaseUrl: 'http://${ip}:${PORT}/api'`);
  console.log('\n' + '='.repeat(60) + '\n');
});


