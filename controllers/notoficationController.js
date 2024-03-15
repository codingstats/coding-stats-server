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

//convert date represented as "Sunday 8:00 AM GMT+5:30" to Date
function convertStringToDate(dateString) {
    const [, day, time, period, offsetHours, offsetMinutes] = dateString.match(/(\w+) (\d{1,2}:\d{2} (AM|PM)) GMT([+-]\d{1,2}):(\d{2})/);
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setHours(date.getHours() + parseInt(offsetHours, 10));
    date.setMinutes(date.getMinutes() + parseInt(offsetMinutes, 10));
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    const currentDay = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + dayIndex - currentDay + (dayIndex < currentDay ? 7 : 0));
    return date;
}

//function to return the element node represented by this xpath
function getElementByXpath(document, path) {
    return document.evaluate(path, document, null, 9, null).singleNodeValue;
}

//function that will return notifications from all the platforms
exports.getNotifications = catchAsync(async (req, res, next) => {

    let response = {};

    //get from codeforces
    // let codeforces = [];
    // try {
    //     response = await axios.get("https://codeforces.com/api/contest.list?gym=false");
    //     const codeforcesRaw = response.data.result?.filter(contest => contest.phase === 'BEFORE');
    //     codeforces = codeforcesRaw.map(contest => {
    //         return {
    //             title: contest.name,
    //             start: getIST(contest.startTimeSeconds),
    //             duration: contest.durationSeconds / 60, //to minutes
    //             link: "https://codeforces.com/contests/"
    //         }
    //     });
    // } catch (e) {
    //     //pass
    // }
    //
    //
    // response = {};
    // let gfg = [];
    // try {
    //     response = await axios.get("https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=upcoming&type=contest");
    //     gfg = response.data.results?.upcoming?.map(contest => {
    //         return {
    //             title: contest.name,
    //             start: new Date(contest.start_time),
    //             duration: getDuration(contest.start_time, contest.end_time),
    //             link: "https://www.geeksforgeeks.org/events"
    //         }
    //     });
    // } catch (e) {
    //     //pass
    // }

    response = {};
    let leetcode = [];
    try {
        response = await axios.get("https://leetcode.com/contest/", {headers: {'Content-Type': 'application/json'}});
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const contestDiv = getElementByXpath(document, "//*[@id=\"__next\"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div");
        for (const contestElement of contestDiv.children) {

            const nodeList = contestElement.querySelectorAll("div");

            leetcode.push({
                title: contestElement.querySelector("span").textContent,
                start: convertStringToDate(nodeList[nodeList.length - 1]),
                duration: null,
                link: 'https://leetcode.com/' + contestElement.querySelector("a").getAttribute("href")
            });
        }
    } catch (e) {
        console.log(e);
    }


    res.status(200).json({
        status: "success", data: {
            // codeforces,
            // gfg,
            leetcode
        }
    })


});