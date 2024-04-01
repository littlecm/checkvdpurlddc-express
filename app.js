const express = require('express');
const axios = require('axios');
const { URL } = require('url');

const app = express();
const port = 3000; // You can use any port that's available

app.get('/', async (req, res) => {
  const { domain, vin } = req.query;

  if (!domain || !vin) {
    return res.status(400).send('Please provide both domain and VIN in the query parameters.');
  }

  const url = `https://${domain}/catcher.esl?vin=${vin}`;

  try {
    const response = await axios.get(url, { maxRedirects: 0, validateStatus: null });
    const hasRedirectToMissingVdp = response.status >= 300 && response.status < 400 && 'location' in response.headers && response.headers.location.includes('redirectFromMissingVDP=true');

    if (hasRedirectToMissingVdp) {
      res.status(404).send('ERROR: Redirected to a missing page.');
    } else {
      res.send('Success: No redirect to a missing page detected.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to make request.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
