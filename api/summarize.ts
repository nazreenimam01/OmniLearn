import { summarizeText } from '../src/flows/summarize';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    try {
      const summary = await summarizeText.run({ text });
      res.status(200).json({ summary });
    } catch (error) {
      console.error('Error running summarizeText:', error);
      res.status(500).send('Error summarizing');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
