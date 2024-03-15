const axios = require('axios');
const catchAsync = require("../util/catchAsync");
const {JSDOM} = require("jsdom");

// function to convert unix time stamps to IST
function getIST(unixTimestamp) {
    const unixTimestampMs = unixTimestamp * 1000;
    const date = new Date(unixTimestampMs);
    return date.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
}

//function to return the difference between timing in minutes
function getDuration(startTimeStr, endTimeStr) {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const timeDifferenceMs = endTime - startTime;
    return timeDifferenceMs / (1000 * 60);
}

//function to return the element node represented by this xpath
function getElementByXpath(document, path) {
    return document.evaluate(path, document, null, 9, null).singleNodeValue;
}

//function that will return notifications from all the platforms
exports.getNotifications = catchAsync(async (req, res, next) => {

    let response = {};

    //get from codeforces
    let codeforces = [];
    try {
        response = await axios.get("https://codeforces.com/api/contest.list?gym=false");
        const codeforcesRaw = response.data.result?.filter(contest => contest.phase === 'BEFORE');
        codeforces = codeforcesRaw.map(contest => {
            return {
                title: contest.name,
                start: new Date(getIST(contest.startTimeSeconds)),
                duration: contest.durationSeconds / 60, //to minutes
                link: "https://codeforces.com/contests/"
            }
        });
    } catch (e) {
        //pass
    }


    response = {};
    let gfg = [];
    try {
        response = await axios.get("https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=upcoming&type=contest");
        gfg = response.data.results?.upcoming?.map(contest => {
            return {
                title: contest.name,
                start: new Date(contest.start_time),
                duration: getDuration(contest.start_time, contest.end_time),
                link: "https://www.geeksforgeeks.org/events"
            }
        });
    } catch (e) {
        //pass
    }

    response = {};
    let leetcode = [];
    try {
        response = await axios.get("https://leetcode.com/contest/");
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const contestDiv = getElementByXpath(document, "//*[@id=\"__next\"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div");
        for (const contestElement of contestDiv.children) {
            leetcode.push({
                title: contestElement.querySelector("span").textContent,
                start: new Date(contestElement.start_time),
                duration: getDuration(contestElement.start_time, contestElement.end_time),
                link: "https://www.geeksforgeeks.org/events"
            })
        }


    } catch (e) {
        //pass
    }


    res.status(200).json({
        status: "success", data: {
            codeforces, gfg
        }
    })


});