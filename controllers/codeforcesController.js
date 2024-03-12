const axios = require('axios');
const catchAsync = require("../util/catchAsync");
const puppeteer = require('puppeteer');

//function to return user info else than heatmap
exports.getUserDetails = catchAsync(async (req, res, next) => {
    //codeforces has an official api to retrieve user data, but the data returned is very limited
    //for example we dont have endpoint to retrieve the streak or total questions submission
    //i will be using puppeteer to webscrap the profile page

    const username = req.params.username;
    const profileLink = `https://codeforces.com/profile/${username}/`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(profileLink);

    const handler = await page.evaluate(() => {
        const xPath = "//*[@id=\"pageContent\"]/div[2]/div/div[2]/div/h1/a";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue.textContent;
    });

    const rank = await page.evaluate(() => {
        const xPath = "//*[@id=\"pageContent\"]/div[2]/div/div[2]/ul/li[1]";
        const text = document.evaluate(xPath, document, null, 9, null).singleNodeValue.innerText;
        const regex = /Contest rating: (\d+)/s;
        const match = text.match(regex);
        return match ? match[1] : 0;
    });


    const streak = await page.evaluate(() => {
        const xPath = "//*[@id=\"pageContent\"]/div[4]/div/div[3]/div[2]/div[1]/div[1]";
        return document.evaluate(xPath, document, null, 9, null).singleNodeValue.textContent.replace(/\D/g, "") || 0;
    });

    const submissionCount = await page.evaluate(() => {
        const xPath = "//*[@id=\"pageContent\"]/div[4]/div/div[3]/div[1]/div[1]/div[1]";
        return [{All: document.evaluate(xPath, document, null, 9, null).singleNodeValue.textContent.replace(/\D/g, "") || 0}];
    });

    res.status(200).json({
        status: 'success', data: {
            profileLink, handler, rank, streak, submissionCount
        }
    })
});

//function to return heatmap data of the user
exports.getUserHeatmap = catchAsync(async (req, res, next) => {
    const username = req.body.username;
    const year = req.body.year;

    if (!username || !year) res.status(400).json({
        status: "fail", message: "username or year not provided!"
    });

    let response;
    try {
        response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=99999999`)
    } catch (e) {
        res.status(400).json({
            status: "fail", message: "user not found!"
        });
    }

    const heatmapRaw = response.data.result.filter(submission => submission.verdict === 'OK').map(submission => submission.creationTimeSeconds);
    // console.log(heatmapRaw);

    const filteredMap = new Map();
    heatmapRaw.forEach((timestamp) => {
        const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
        if (date.getFullYear() === year) {
            date.setHours(0, 0, 0, 0);
            const key = date.getTime(); // Get the Unix timestamp for the start of the day
            filteredMap.set(key, (filteredMap.get(key) || 0) + 1);
        }
    });

    const heatmap = {};
    for (const [time, count] of filteredMap) {
        heatmap[time] = count;
    }

    res.status(200).json({
        status: "success", data: {
            heatmapData: heatmap
        }
    });
});
