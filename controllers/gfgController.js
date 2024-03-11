const axios = require('axios');
const {JSDOM} = require('jsdom');
const catchAsync = require("../util/catchAsync");

//function to get DOM node represented by the given xpath
function getElementByXpath(document, path) {
    return document.evaluate(path, document, null, 9, null).singleNodeValue;
}

//returns user details else than heatmap and coding question links
exports.getUserDetails = catchAsync(async (req, res, next) => {
    //we will be scrapping the profile page for information
    //gfg does not have any official api
    const username = req.params.username;
    const gfgProfileLink = "https://auth.geeksforgeeks.org/user/" + username;

    const response = await axios.get(gfgProfileLink);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    //if there is no such user
    if (!document.querySelector(".profile_container")) {
        res.status(400).json({
            status: 'fail',
            message: "User does not exists"
        });
    }

    //user id is in script tag, inside a js object. scrap that string using regex
    let userId = 0;
    const regex = /user_id: (".*?")/s;
    const match = response.data.match(regex);
    if (match)
        userId = JSON.parse(match[1]);

    const image = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[1]/div[1]/img")?.getAttribute("src");
    const handler = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[1]/div[2]/div[1]")?.textContent;
    const institute = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Institute']")?.nextElementSibling.textContent;
    const instituteRank = document.querySelector('[data-tooltip="Institute Rank"]')?.textContent.replace(/\D/g, "");
    const campusAmbassador = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[3]/div[2]/a")?.textContent;
    const streak = document.querySelector('[data-tooltip="Longest streak/Global longest streak"]')?.textContent.split("/")[0].trim();
    const overallCodingScore = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[1]/div/div/span[2]")?.textContent;
    const monthlyCodingScore = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[3]/div/div/span[2]")?.textContent;
    const languagesUsed = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Language Used']")?.nextElementSibling.textContent.split(",");
    const totalProblemSolved = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[2]/div/div/span[2]")?.textContent;
    const school = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[1]/a")?.textContent.replace(/\D/g, "");
    const basic = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[2]/a")?.textContent.replace(/\D/g, "");
    const easy = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[3]/a")?.textContent.replace(/\D/g, "");
    const medium = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[4]/a")?.textContent.replace(/\D/g, "");
    const hard = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[5]/a")?.textContent.replace(/\D/g, "");

    res.status(200).json({
        status: 'success', data: {
            gfgProfileLink, userId, image, handler,
            institute, instituteRank, campusAmbassador, streak, overallCodingScore,
            monthlyCodingScore, languagesUsed, totalProblemSolved, school, basic, easy, medium,
            hard
        }
    });
});

//returns the heatmap data of the user
//heatmap data is intended be sent even if year is more than current year
exports.getUserHeatmap = catchAsync(async (req, res, next) => {
    const username = req.body.username;
    const userid = req.body.userid;
    let year = req.body.year;

    if (!username || !userid || !year) {
        res.status(400).json({
            status: "fail",
            message: "username or userid or year not provided"
        });
    }

    if (year === new Date().getFullYear()) year = -1;

    //api needs form data
    const bodyFormData = new FormData();
    bodyFormData.append('year', year);
    bodyFormData.append('user_name', username);
    bodyFormData.append('user_id', userid);

    const response = await axios({
        method: "post",
        url: "https://auth.geeksforgeeks.org/profileV2/heat-map.php",
        data: bodyFormData,
        headers: {"Content-Type": "multipart/form-data"},
    });

    const regex = /var heatmapData = ({.*?});/s;
    const match = response.data.match(regex);
    let heatmapData = {};

    if (match) {
        const heatmapDataString = match[1];
        heatmapData = JSON.parse(heatmapDataString);
    }

    res.status(200).json({
        status: "success",
        data: {
            heatmapData
        }
    });
});