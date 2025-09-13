// App bootstrap: security, JSON parsing, open /health, API key protection, and routes mounting.
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

require('./db');
const apiKey = require('./middleware/apiKey');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(apiKey);

app.use('/', require('./routes/items'));
app.use('/', require('./routes/categories'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
