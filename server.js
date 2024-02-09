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

// ******* Web Scraper 1.2 (Cheerio + Puppeteer) ******* //
const runScrapers = async () => {
  try {
    await Promise.all([
      scrapeOverview(),
      scrapeGeneral(),
      scrapeNsss(),
      scrapeRcs(),
      scrapeCore(),
      scrapeMaterial(),
      scrapeRpv(),
    ]);

    await mergeData();
  } catch (error) {
    console.error(error.message);
  }
};

// ********** MongoDB Merge ************ //
const insertToMongoDB = async (data) => {
  try {
    // Insert all merged data documents into Mongodb via Reactor Model
    await Reactor.insertMany(data);
    console.log('data inserted successfully');
  } catch (err) {
    console.error(err);
  }
};

// IIFE - Run scrape and insertion in order
// (async () => {
//   await runScrapers();
//   await insertToMongoDB(reactorDataMerged);
// })();
