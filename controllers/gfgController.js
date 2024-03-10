const axios = require('axios');
const {JSDOM} = require('jsdom');
const catchAsync = require("../util/catchAsync");

function getElementByXpath(document, path) {
    return document.evaluate(path, document, null, 9, null).singleNodeValue;
}


exports.default = catchAsync(async (req, res, next) => {
    res.status(400).json({
        status: 'fail',
        message: "Username not provided"
    });
});

exports.getUserDetails = catchAsync(async (req, res, next) => {
    const username = req.params.username;

    const response = await axios.get("https://auth.geeksforgeeks.org/user/" + username);

    console.log(">>");
    console.log(response.data)
    console.log(">>");

    const dom = new JSDOM(`response.data`);


    console.log(">");
    console.log(dom.window.document.querySelector("p").textContent);
    console.log(">");

    res.status(200).json({
        status: 'success', data: {
            username,
            // response
        }
    });
});