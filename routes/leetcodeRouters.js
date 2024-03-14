const express = require("express");
const leetcodeController = require("../controllers/platformControllers/leetcodeController");
const router = express.Router();

router.route('/userdetails/:username').get(leetcodeController.getUserDetails);
router.route('/userheatmap').post(leetcodeController.getUserHeatmap);

module.exports = router;