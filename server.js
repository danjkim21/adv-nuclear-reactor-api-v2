// ************** Modules ************** //
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({ path: './config/.env' });

// ************* Variables ************* //
const port = process.env.PORT || 8000;
const scrape = require('./scripts/scrape');
const handleData = require('./scripts/dataMerge');
const { reactorDataMerged } = require('./db/data-merged');

// ************* Middleware ************ //
app.use(cors());
app.use(express.json());

// *********** API framework *********** //
app.use('/api/', require('./routes/apiRoutes'));

// Listens on Server using PORT variable
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});

// ******* Web Scraper 1.0 (Cheerio + Puppeteer) ******* //
let runScraper = async () => {
  // Scrape all sites
  let overview = await scrape.scrapeOverview();
  let general = await scrape.scrapeGeneral();
  let nsss = await scrape.scrapeNsss();
  let rcs = await scrape.scrapeRcs();
  let core = await scrape.scrapeCore();
  let material = await scrape.scrapeMaterial();
  let rpv = await scrape.scrapeRpv();

  // Once all sites scraping are complete > merge the data into data-merged.js
  Promise.all([overview, general, nsss, rcs, core, material, rpv])
    .then(() => {
      handleData.mergeData();
    })
    .catch((error) => {
      console.error(error.message);
    });
};

// runScraper();
