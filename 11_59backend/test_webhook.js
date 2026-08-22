// No import needed for fetch in Node.js 18+

const WEBHOOK_URL = 'http://localhost:5000/api/dashboard/webhook/complete';
const RECORD_ID = '6a7dcafad51134b8afbf8c33'; // Latest document ID from our query

async function test() {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recordId: RECORD_ID,
      output: 'This is a test generated content from scratch script!',
      status: 'completed'
    })
  });
  
  const result = await response.json();
  console.log("Response status:", response.status);
  console.log("Response body:", result);
}

test().catch(console.error);
