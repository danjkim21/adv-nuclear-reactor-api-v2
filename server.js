// ************** Modules ************** //
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config({ path: './config/.env' });

// ************* Variables ************* //
const port = process.env.PORT || 8000;
const scrape = require('./scripts/scrape');
const handleData = require('./scripts/dataMerge');
const { reactorDataMerged } = require('./db/data-merged');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const Reactor = require('./models/Reactor.js');

// ***** Passport config ***** //
const passport = require('./config/passport');

// ************* Middleware ************ //
app.use(cors());
app.use(express.json());

// ************* MongoDB Connection ************ //
const connectDB = async () => {
  try {
    // ***** Connect to MongoDB ***** //
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

// ***** Sessions ***** //
// app.use(
//   session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false,
//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
//   })
// );
app.use(
  session({
    secret: 'foo',
    store: MongoStore.create({ mongoUrl: process.env.DB_STRING }),
    resave: true,
    saveUninitialized: true,
  })
);

// ***** Passport middleware ***** //
app.use(passport.initialize());
app.use(passport.session());

// *********** Routes/Pathing *********** //
app.use('/api/', apiRoutes);
app.use('/auth', authRoutes);

// ******* Web Scraper 1.1 (Cheerio + Puppeteer) ******* //
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

// ********** MongoDB Merge ************ //
let insertToMongoDB = async (data) => {
  try {
    // Insert all merged data documents into Mongodb via Reactor Model
    await Reactor.insertMany(data);
    console.log('data logged');
  } catch (err) {
    console.error(err);
  }
};

// insertToMongoDB(reactorDataMerged);
