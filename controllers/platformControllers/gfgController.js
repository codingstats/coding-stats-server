const axios = require('axios');
const {JSDOM} = require('jsdom');
const catchAsync = require("../../util/catchAsync");
const puppeteer = require('puppeteer');


//check if user with this username exists, if exists return userid if exists
exports.validateUser = catchAsync(async (req, res, next) => {
    const username = req.params.username;
    const response = await axios.get(`https://auth.geeksforgeeks.org/user/${username}`);

    // user id is in script tag, inside a js object. scrap that string using regex
    const regex = /user_id: (".*?")/s;
    const match = response.data.match(regex);
    if (match) {
        res.status(200).json({
            status: "success", userId: JSON.parse(match[1])
        });
    }

    res.status(400).json({
        status: "fail",
        message: "no such user!"
    });

});


//returns user details else than heatmap
exports.getUserDetails = catchAsync(async (req, res, next) => {
    //we will be scrapping the profile page for information
    //gfg does not have any official api
    const username = req.params.username;
    const profileLink = "https://auth.geeksforgeeks.org/user/" + username;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(profileLink);

    const check = await page.evaluate(() => {
        return document.querySelector(".profile_container");
    });

    //if there is no such user
    if (!check) {
        res.status(400).json({
            status: 'fail', message: "User does not exists"
        });
    }

    const handler = await page.evaluate(() => document.querySelector(".profile_name").textContent || "");
    console.log(handler);

    const institute = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Institution']";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.nextElementSibling?.textContent || "";
    });

    const rank = await page.evaluate(() => document.querySelector('[data-tooltip="Institute Rank"]')?.textContent.replace(/\D/g, "") || 0);

    const campusAmbassador = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[3]/div[2]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent || "";
    });

    const streak = await page.evaluate(() => {
        return document.querySelector('[data-tooltip="Longest streak/Global longest streak"]')?.textContent.split("/")[0].trim() || 0
    });

    const overallCodingScore = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[1]/div/div/span[2]";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent || 0;
    });

    const monthlyCodingScore = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[3]/div/div/span[2]";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent || 0;
    });

    const languagesUsed = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Language Used']";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.nextElementSibling?.textContent.split(",") || [];
    });

    const totalProblemSolved = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[2]/div/div/span[2]";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent || 0;
    });

    const school = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[1]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent.replace(/\D/g, "") || 0;
    });

    const basic = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[2]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent.replace(/\D/g, "") || 0;
    });

    const easy = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[3]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent.replace(/\D/g, "") || 0;
    });

    const medium = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[4]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent.replace(/\D/g, "") || 0;
    });

    const hard = await page.evaluate(() => {
        const xPath = "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[5]/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue?.textContent.replace(/\D/g, "") || 0;
    });

    const submissionCount = [{difficulty: 'All', count: totalProblemSolved}, {
        difficulty: 'School', count: school
    }, {difficulty: 'Basic', count: basic}, {difficulty: 'Easy', count: easy}, {
        difficulty: 'Medium', count: medium
    }, {difficulty: 'Hard', count: hard}]

    res.status(200).json({
        status: 'success', data: {
            profileLink, // userId,
            handler,
            institute,
            rank,
            campusAmbassador,
            streak,
            overallCodingScore,
            monthlyCodingScore,
            languagesUsed,
            submissionCount
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
            status: "fail", message: "username or userid or year not provided"
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
        status: "success", data: {
            heatmapData
        }
    });
});