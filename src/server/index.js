import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 8000;

// Directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// API calls

// Get astro photo of the day
app.get('/apod', async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then(res => res.json());
    res.send({ image });
  } catch (err) {
    console.log('error:', err);
  }
});

// Get rover by name parameter
app.get('/rover/:name', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/latest_photos?api_key=${process.env.API_KEY}`);
      if (!response.ok) {
        return res.status(404).json({ error: 'Rover not found' });
      }
    const images = await response.json();
    res.json(images);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Export tests
export default app;
