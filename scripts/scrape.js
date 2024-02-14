// ************** Modules ************** //
const _ = require('lodash-core');
const chromium = require('@sparticuz/chromium-min');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const { executablePath } = require('puppeteer');
const { insertToMongoDB } = require('./insertToMongoDb');

const handleScrape = async () => {
  console.log('running script');
  const {
    reactorsListOverview,
    reactorsListCore,
    reactorsListGeneral,
    reactorsListMaterial,
    reactorsListNsss,
    reactorsListRcs,
    reactorsListRpv,
  } = await runScrappers();

  const reactorsListMerged = await mergeData(
    reactorsListOverview,
    reactorsListCore,
    reactorsListGeneral,
    reactorsListMaterial,
    reactorsListNsss,
    reactorsListRcs,
    reactorsListRpv
  );

  await insertToMongoDB(reactorsListMerged);
};

const runScrappers = async () => {
  console.log('running scrapers');
  try {
    const { reactorsList: reactorsListOverview } = await scrapeOverview();
    const { reactorsList: reactorsListCore } = await scrapeCore();
    const { reactorsList: reactorsListGeneral } = await scrapeGeneral();
    const { reactorsList: reactorsListMaterial } = await scrapeMaterial();
    const { reactorsList: reactorsListNsss } = await scrapeNsss();
    const { reactorsList: reactorsListRcs } = await scrapeRcs();
    const { reactorsList: reactorsListRpv } = await scrapeRpv();

    return {
      reactorsListOverview,
      reactorsListCore,
      reactorsListGeneral,
      reactorsListMaterial,
      reactorsListNsss,
      reactorsListRcs,
      reactorsListRpv,
    };
  } catch (error) {
    console.error(error.message);
  }
};

const mergeData = async (
  reactorsListOverview,
  reactorsListCore,
  reactorsListGeneral,
  reactorsListMaterial,
  reactorsListNsss,
  reactorsListRcs,
  reactorsListRpv
) => {
  console.log('scrape complete - merging datasets');
  try {
    const reactorsListMerged = await _(reactorsListOverview)
      .concat(
        reactorsListCore,
        reactorsListGeneral,
        reactorsListMaterial,
        reactorsListNsss,
        reactorsListRcs,
        reactorsListRpv
      )
      .groupBy('name')
      .map(_.spread(_.merge))
      .value();

    console.log(
      `Merge completed. ${reactorsListMerged.length} added to data-merged.js`
    );

    return reactorsListMerged;
  } catch (error) {
    console.error(error.message);
  }
};

// ******* Web Scraper 1.0 (Cheerio + Puppeteer) ******* //
// Source data
const urls = {
  overview: 'https://aris.iaea.org/sites/overview.html',
  general: 'https://aris.iaea.org/sites/general.html',
  nsss: 'https://aris.iaea.org/sites/NSSS.html',
  rcs: 'https://aris.iaea.org/sites/RCS.html',
  core: 'https://aris.iaea.org/sites/core.html',
  material: 'https://aris.iaea.org/sites/material.html',
  rpv: 'https://aris.iaea.org/sites/RPV.html',
};

// ******* Scrape Functions ******* //
// Puppeteer Browser Launch with config options
async function getBrowser() {
  // local development is broken for this 👇
  // but it works in vercel so I'm not gonna touch it
  // see: https://www.stefanjudis.com/blog/how-to-use-headless-chrome-in-serverless-functions/
  return puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar`
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}
async function scrapeOverview() {
  // -- Run Puppeteer -- //
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.overview);

  // Runs headless HTML chromium browser and returns html data
  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  // -- Run Cheerio -- //
  // Parse pageData from puppeteer through cheerio
  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  // Stores data for all reactors into array: reactorsList
  let reactorsList = [];
  let reactorDesign = {};

  // Use .each method to loop through the li we selected
  tableData.each((index, el) => {
    // Object holding data for each reactorDesign
    reactorDesign = {
      name: '',
      nameWebsite: '',
      fullName: '',
      designOrg: '',
      designOrgWebsite: '',
      coolant: '',
      moderator: '',
      designStatus: '',
      country: '',
      type: '',
      purpose: '',
    };

    // Select the text content of a and span elements
    // Store the textcontent in the above object
    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.nameWebsite = $(el)
      .children('td:nth-child(1)')
      .find('a')
      .attr('href');
    reactorDesign.fullName = $(el).children('td:nth-child(2)').text().trim();
    reactorDesign.designOrg = $(el).children('td:nth-child(3)').text().trim();
    reactorDesign.designOrgWebsite = $(el)
      .children('td:nth-child(3)')
      .find('a')
      .attr('href');
    reactorDesign.coolant = $(el).children('td:nth-child(4)').text().trim();
    reactorDesign.moderator = $(el).children('td:nth-child(5)').text().trim();
    reactorDesign.designStatus = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();
    reactorDesign.country = $(el).children('td:nth-child(7)').text().trim();
    reactorDesign.type = $(el).children('td:nth-child(8)').text().trim();
    reactorDesign.purpose = $(el).children('td:nth-child(9)').text().trim();

    // Populate reactorsList array with reactorDesign data
    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-overview.js`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeGeneral() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.general);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      neutronSpectrum: '',
      thermalOutput: '',
      outputGross: '',
      outputNet: '',
      efficiency: '',
      thermodynamicCycle: '',
      nonElecApplications: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.neutronSpectrum = $(el)
      .children('td:nth-child(2)')
      .text()
      .trim();
    reactorDesign.thermalOutput = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.outputGross = $(el).children('td:nth-child(4)').text().trim();
    reactorDesign.outputNet = $(el).children('td:nth-child(5)').text().trim();
    reactorDesign.efficiency = $(el).children('td:nth-child(6)').text().trim();
    reactorDesign.thermodynamicCycle = $(el)
      .children('td:nth-child(7)')
      .text()
      .trim();
    reactorDesign.nonElecApplications = $(el)
      .children('td:nth-child(8)')
      .text()
      .trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-general.js`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeNsss() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.nsss);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      steamFlowRate: '',
      steamPressure: '',
      steamTemp: '',
      feedWaterFlowRate: '',
      feedWaterTemp: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.steamFlowRate = $(el)
      .children('td:nth-child(2)')
      .text()
      .trim();
    reactorDesign.steamPressure = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.steamTemp = $(el).children('td:nth-child(4)').text().trim();
    reactorDesign.feedWaterFlowRate = $(el)
      .children('td:nth-child(5)')
      .text()
      .trim();
    reactorDesign.feedWaterTemp = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-nsss.js'`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeRcs() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.rcs);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      coolant: '',
      primaryCoolantFlowRate: '',
      operatingPressure: '',
      coolantInletTemp: '',
      coolantOutletTemp: '',
      deltaTemp: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.coolant = $(el).children('td:nth-child(2)').text().trim();
    reactorDesign.primaryCoolantFlowRate = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.operatingPressure = $(el)
      .children('td:nth-child(4)')
      .text()
      .trim();
    reactorDesign.coolantInletTemp = $(el)
      .children('td:nth-child(5)')
      .text()
      .trim();
    reactorDesign.coolantOutletTemp = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();
    reactorDesign.deltaTemp = $(el).children('td:nth-child(7)').text().trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-rcs.js'`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeCore() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.core);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      coreHeight: '',
      equivCoreDiameter: '',
      avgLinearHeatRate: '',
      avgFuelPowerDensity: '',
      avgCorePowerDensity: '',
      outerCoreDiameterFuelRods: '',
      rodArray: '',
      latticeGeometry: '',
      numOfFuelAssemblies: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.coreHeight = $(el).children('td:nth-child(2)').text().trim();
    reactorDesign.equivCoreDiameter = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.avgLinearHeatRate = $(el)
      .children('td:nth-child(4)')
      .text()
      .trim();
    reactorDesign.avgFuelPowerDensity = $(el)
      .children('td:nth-child(5)')
      .text()
      .trim();
    reactorDesign.avgCorePowerDensity = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();
    reactorDesign.outerCoreDiameterFuelRods = $(el)
      .children('td:nth-child(7)')
      .text()
      .trim();
    reactorDesign.rodArray = $(el).children('td:nth-child(8)').text().trim();
    reactorDesign.latticeGeometry = $(el)
      .children('td:nth-child(9)')
      .text()
      .trim();
    reactorDesign.numOfFuelAssemblies = $(el)
      .children('td:nth-child(10)')
      .text()
      .trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-core.js'`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeMaterial() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.material);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      fuelMaterial: '',
      claddingMaterial: '',
      reloadFuelEnrichment: '',
      fuelCycleLength: '',
      avgDischargeBurnup: '',
      burnableAbsorber: '',
      controlRodAbsorber: '',
      solubleNeutronAbsorber: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.fuelMaterial = $(el)
      .children('td:nth-child(2)')
      .text()
      .trim();
    reactorDesign.claddingMaterial = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.reloadFuelEnrichment = $(el)
      .children('td:nth-child(4)')
      .text()
      .trim();
    reactorDesign.fuelCycleLength = $(el)
      .children('td:nth-child(5)')
      .text()
      .trim();
    reactorDesign.avgDischargeBurnup = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();
    reactorDesign.burnableAbsorber = $(el)
      .children('td:nth-child(7)')
      .text()
      .trim();
    reactorDesign.controlRodAbsorber = $(el)
      .children('td:nth-child(8)')
      .text()
      .trim();
    reactorDesign.solubleNeutronAbsorber = $(el)
      .children('td:nth-child(9)')
      .text()
      .trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-material.js'`
  );
  await browser.close();

  return { reactorsList };
}

async function scrapeRpv() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(urls.rpv);

  const pageData = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML,
    };
  });

  const $ = cheerio.load(pageData.html);
  const tableData = $('#itemListTable > tbody > tr');

  let reactorsList = [];
  let reactorDesign = {};

  tableData.each((index, el) => {
    reactorDesign = {
      name: '',
      innerDiameterCylindricalShell: '',
      wallThicknessCylindricalShell: '',
      baseMaterial: '',
      totHeightInside: '',
      transportWeight: '',
    };

    reactorDesign.name = $(el).children('td:nth-child(1)').text().trim();
    reactorDesign.innerDiameterCylindricalShell = $(el)
      .children('td:nth-child(2)')
      .text()
      .trim();
    reactorDesign.wallThicknessCylindricalShell = $(el)
      .children('td:nth-child(3)')
      .text()
      .trim();
    reactorDesign.baseMaterial = $(el)
      .children('td:nth-child(4)')
      .text()
      .trim();
    reactorDesign.totHeightInside = $(el)
      .children('td:nth-child(5)')
      .text()
      .trim();
    reactorDesign.transportWeight = $(el)
      .children('td:nth-child(6)')
      .text()
      .trim();

    reactorsList.push(reactorDesign);
  });

  console.log(
    `Scrape completed. ${reactorsList.length} objects added to data-rpv.js'`
  );
  await browser.close();

  return { reactorsList };
}

module.exports = {
  handleScrape,
  scrapeOverview,
  scrapeGeneral,
  scrapeNsss,
  scrapeRcs,
  scrapeCore,
  scrapeMaterial,
  scrapeRpv,
};
