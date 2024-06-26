const express = require('express');
const router = express.Router();
const Web3 = require("web3");
const commonAbi  = require('./Blockchain.json')
router.use(express.json()); 



router.route('/transfer').post(async function(req, res, next) {
  
  
    
});

module.exports = router;
