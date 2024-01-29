const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const os = require('os');


const app = express();
const port = process.env.PORT || 3002;

const cache = {};

app.use(cors({ origin: '*' })); 
app.use(express.static('public'));
app.use(express.json());


app.get('/pnr-status/:pnrNumber', async (req, res) => {
    const pnrNumber = req.params.pnrNumber;

    if (!pnrNumber) {
        return res.status(400).json({ error: 'Please provide a PNR number.' });
    }

    const options = {
        method: 'GET',
        url: `https://pnr-status-indian-railway.p.rapidapi.com/pnr-check/${pnrNumber}`,
        headers: {
            'X-RapidAPI-Key': '{Your-API-Key}',
            'X-RapidAPI-Host': 'pnr-status-indian-railway.p.rapidapi.com'
        },
    };

    try {
        const response = await axios.request(options);
        const responseData = response.data;
        res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/stations', async (req, res) => {
  const { q, limit } = req.query;
  const apiUrl = `https://api.railwayapi.site/api/v1/stations?q=${q}&limit=${limit}`;
  const cacheKey = `${q}_${limit}`;

  try {
      if (cache[cacheKey]) {
          console.log('Fetching from cache:', cacheKey);
          res.json(cache[cacheKey]);
      } else {
          const response = await axios.get(apiUrl);
          const data = response.data;
          cache[cacheKey] = data;


          res.json(data);
      }
  } catch (error) {
      console.error('Error fetching stations:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Parallel Requests s and d
app.get('/api/parallel/stations', async (req, res) => {
    const { sourceQ, destinationQ, limit } = req.query;
    const sourceApiUrl = `https://api.railwayapi.site/api/v1/stations?q=${sourceQ}&limit=${limit}`;
    const destinationApiUrl = `https://api.railwayapi.site/api/v1/stations?q=${destinationQ}&limit=${limit}`;

    try {
        const [sourceResponse, destinationResponse] = await Promise.all([
            axios.get(sourceApiUrl),
            axios.get(destinationApiUrl)
        ]);

        const sourceData = sourceResponse.data;
        const destinationData = destinationResponse.data;

        res.json({ source: sourceData, destination: destinationData });
    } catch (error) {
        console.error('Error fetching stations in parallel:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/searchTrain', async (req, res) => {
    const { fromStationCode, toStationCode } = req.body;

    if (!fromStationCode || !toStationCode) {
        return res.status(400).json({ error: 'Please provide both source and destination station codes.' });
    }

    const apiUrl = `https://api.railwayapi.site/api/v1/trainsBtwStations?fromStation=${fromStationCode}&toStation=${toStationCode}&allTrains=true`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data.data;
        res.json(data);
    } catch (error) {
        console.error('Error fetching train data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.listen(port, () => {
    const networkInterfaces = os.networkInterfaces();
    let ipAddress = 'localhost';
    
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const networkInterface = networkInterfaces[interfaceName];
        networkInterface.forEach(address => {
            if (!address.internal && address.family === 'IPv4') {
                ipAddress = address.address;
                return;
            }
        });
    });

    console.log(`Express server listening on port ${port}`);
    console.log(`Local:            http://localhost:${port}`);
    console.log(`On Your Network:  http://${ipAddress}:${port}`);
});
