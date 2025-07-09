import {onRequest} from "firebase-functions/v2/https";
import {summarizeText} from "./flows/summarize";

export const summarize = onRequest(async (req, res) => {
  const {text} = req.body;

  try {
    const summary = await summarizeText.run({text});
    res.json({summary});
  } catch (err) {
    console.error("Summarization failed:", err);
    res.status(500).send("Error");
  }
});


