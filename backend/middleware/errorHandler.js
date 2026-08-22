// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message && err.message.includes('Unauthenticated')) {
    return res.status(401).json({ error: 'Access Token Signature Invalid or Expired' });
  }

  res.status(500).json({ 
    error: 'A systemic error occurred inside the gateway engine.',
    details: err.message
  });
};