import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { handleMessage } from './agent.js';

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Webhook doğrulama - Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Mesaj geldiğinde
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  
  if (message) {
    const from = message.from;
    const text = message.text?.body || '';
    console.log(`Gelen: ${from} - ${text}`);
    await handleMessage(from, text);
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('DEMLAB Ajan Aktif 🪵 - /admin için şifre gerekli'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ajan çalışıyor: ${PORT}`));
