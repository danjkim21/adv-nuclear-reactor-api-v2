const express = require('express');
const router = express.Router();
const {
  getAllReactorData,
  getReactor,
} = require('../controller/apiController');

// path '/api/'
// GETS the adv. reactors API - Not filtered
router.get('/', getAllReactorData);

// path '/api/:name'
// GETS the adv. reactors API - filtered by NAME
router.get('/:name', getReactor);

module.exports = router;
