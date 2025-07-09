import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');

  const summarize = async () => {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={summarize}>Summarize</button>
      <h2>Summary:</h2>
      <p>{summary}</p>
    </div>
  );
}
