var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  const _response = { msg: "OK", page: '/' }
  res.status(200).send(_response);
});

module.exports = router;
