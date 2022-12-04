// ************** Modules ************** //
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });

// ************* Variables ************* //
const port = process.env.PORT || 8000;
const scrape = require("./scripts/scrape");
const handleData = require("./scripts/dataMerge");
const { reactorDataMerged } = require("./db/data-merged");

// ************* Middleware ************ //
app.use(cors());
app.use(express.json());

// ************* MongoDB Connection ************ //
const connectDB = async () => {
  try {
    // ***** DB Connection ***** //
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // ***** Run Server Connection ***** //
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}/`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB();

// *********** API framework *********** //
app.use("/api/", require("./routes/apiRoutes"));

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
