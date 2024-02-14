// ************** Modules ************** //
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config({ path: './config/.env' });

// ************* Variables & Functions ************* //
const port = process.env.PORT || 8000;
const { handleScrape } = require('./scripts/scrape');
const { mergeData } = require('./scripts/dataMerge');
const { insertToMongoDB } = require('./scripts/insertToMongoDb.js');
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
mongoose.set('strictQuery', false);

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

// ******* IIFE - Run scrape and insertion in order ******* //
// TODO: Figure out how to move this to a cron job in Vercel
(async () => {
  // Web Scraper 1.2 (Cheerio + Puppeteer)
  // await handleScrape();
  // Merge `data-merged.js` to MongoDB
  // await insertToMongoDB(reactorDataMerged);
})();
