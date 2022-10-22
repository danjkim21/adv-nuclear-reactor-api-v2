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
// path '/api/' -- GETS the adv. reactors API - Not filtered
app.get('/api', (request, response) => {
  // save request to reactorName and converts to lowerCase
  response.json(reactorDataMerged);
});

// path '/api/:name' -- GETS the adv. reactors API - filtered by NAME
app.get('/api/:name', (request, response) => {
  // save request to reactorName and converts to lowerCase
  const reactorName = request.params.name.toLowerCase();
  console.log(`Entered: ${reactorName}`);

  if (reactorDataMerged.filter((elem) => elem.name.toLowerCase() === reactorName.toLowerCase())) {
    response.json(
      reactorDataMerged.filter((elem) => elem.name.toLowerCase() === reactorName.toLowerCase())
    );
  } else {
    response.status(404).end();
  }
});

// Listens on Server using PORT variable
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});


// ******* Web Scraper 1.0 (Cheerio + Puppeteer) ******* //

async function runScraper() {
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
}

// runScraper();