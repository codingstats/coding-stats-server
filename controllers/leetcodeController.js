const axios = require('axios');
const catchAsync = require("../util/catchAsync");

//returns user details else than heatmap and coding question links
exports.getUserDetails = catchAsync(async (req, res, next) => {
    //we will be using graphql to retrieve user details from leetcode api
    //leetcode does not have official api

    let data = JSON.stringify({
        query: `query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
             submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
             }
        }
   }`, variables: {"username": "meow"}
    });

    let config = {
        method: 'post',
        url: 'https://leetcode.com/graphql/',
        headers: {'Content-Type': 'application/json',},
        data: data
    };

    const response = await axios(config);

    console.log(response.data);

    res.status(200).json({
        status: "success", data: {
            response: ""
        }
    });

});