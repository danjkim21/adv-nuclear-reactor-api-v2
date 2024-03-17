const express = require("express");
const router = express.Router();
const {
  getAllReactorData,
  getReactor,
  getReactorTypes,
  getReactorsByType,
  getReactorsBySize,
} = require("../controller/apiController");

// path '/api/'
// GETS the adv. reactors API - Not filtered
router.get("/", getAllReactorData);

// path '/api/categories'
// GETS the adv. reactors API - returns all unique reactor types
router.get("/categories", getReactorTypes);

// path '/api/categories/:type'
// GETS the adv. reactors API - filters reactors by type
router.get("/categories/:type", getReactorsByType);

// path '/api/:name'
// GETS the adv. reactors API - filtered by NAME
router.get("/:name", getReactor);

// path '/api/size'
// GETS adv. reactors by thermal output size / mWe
router.get("/size/:output", getReactorsBySize);

module.exports = router;
