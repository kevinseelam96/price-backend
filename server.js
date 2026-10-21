const express = require('express');
const axios = require('axios'); 
const cors = require('cors');   
const app = express();

app.use(cors());

const APIFY_TOKEN = process.env.APIFY_TOKEN; 

app.get('/api/search', async (req, res) => {
    const productQuery = req.query.q; 
    if (!productQuery) return res.status(400).json({ error: "No search query" });

    const apifyUrl = `https://api.apify.com/v2/actors/junglee~amazon-crawler/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

    try {
        const amazonSearchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productQuery)}`;
        const response = await axios.post(apifyUrl, {
            categoryOrProductUrls: [{ url: amazonSearchUrl }],
            maxItemsPerStartUrl: 5 
        });

        const formattedResults = response.data.map(item => {
            return {
                name: item.title,       
                image: item.thumbnailImage || item.image,   
                prices: [
                    { store: "Amazon", price: item.price ? item.price.value : "Check site", link: item.url, class: "amazon", btnClass: "btn-amazon" }
                ]
            };
        });
        res.json(formattedResults);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch prices" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
