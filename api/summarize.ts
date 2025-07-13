export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    // Return fake summary
    return res.status(200).json({
      summary: "This is a simplified summary (demo response)."
    });
  } else {
    res.status(405).end(); // Method not allowed
  }
}

