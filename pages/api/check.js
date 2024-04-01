const axios = require('axios');

export default async function handler(req, res) {
  const { domain, vin } = req.query;

  if (!domain || !vin) {
    return res.status(400).json({ error: 'Please provide both domain and VIN as query parameters.' });
  }

  const url = `https://${domain}/catcher.esl?vin=${vin}`;

  try {
    const response = await axios.get(url, { maxRedirects: 0, validateStatus: null });
    const hasRedirectToMissingVdp = response.status >= 300 && response.status < 400 && 'location' in response.headers && response.headers.location.includes('redirectFromMissingVDP=true');

    if (hasRedirectToMissingVdp) {
      res.status(404).json({ error: 'Redirected to a missing page.' });
    } else {
      res.status(200).json({ message: 'No redirect to a missing page detected.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to make request.' });
  }
}
