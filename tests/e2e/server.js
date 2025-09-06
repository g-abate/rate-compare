/**
 * Simple web server for E2E tests
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the project root
app.use(express.static(join(__dirname, '../..')));

// Serve the test HTML file at the root
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
