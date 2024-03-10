const express = require("express");
const gfgController = require("./../controllers/gfgController");
const router = express.Router();

//retrieve data about lessons
//ask me what rout is for what purpose
router.route('/').get(gfgController.default);
router.route('/:username').get(gfgController.getUserDetails);

module.exports = router;