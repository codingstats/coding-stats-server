const express = require("express");
const gfgController = require("./../controllers/gfgController");
const router = express.Router();

router.route('/userdetails/:username').get(gfgController.getUserDetails);
router.route('/userheatmap').post(gfgController.getUserHeatmap);

module.exports = router;