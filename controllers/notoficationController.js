const axios = require('axios');
const catchAsync = require("../util/catchAsync");
const {JSDOM} = require("jsdom");

// function to convert unix time stamps to IST
function getIST(unixTimestamp) {
    const unixTimestampMs = unixTimestamp * 1000;
    const date = new Date(unixTimestampMs);
    const istTime = date.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    return istTime;
}

function getDuration(startTimeStr, endTimeStr) {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const timeDifferenceMs = endTime - startTime;
    const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
    return timeDifferenceMinutes;
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


    res.status(200).json({
        status: "success", data: {
            codeforces, gfg
        }
    })


});