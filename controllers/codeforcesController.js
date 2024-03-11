const axios = require('axios');
const catchAsync = require("../util/catchAsync");

exports.getUserDetails = catchAsync(async (req, res, next) => {
    const username = req.params.username;
    //official codeforces api to fetch user details
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=99999`);

    console.log(response.data);


    // const image = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[1]/div[1]/img")?.getAttribute("src");
    // const handler = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[1]/div[2]/div[1]")?.textContent;
    // const institute = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Institute']")?.nextElementSibling.textContent;
    // const instituteRank = document.querySelector('[data-tooltip="Institute Rank"]')?.textContent.replace(/\D/g, "");
    // const campusAmbassador = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[3]/div[2]/a")?.textContent;
    // const streak = document.querySelector('[data-tooltip="Longest streak/Global longest streak"]')?.textContent.split("/")[0].trim();
    // const overallCodingScore = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[1]/div/div/span[2]")?.textContent;
    // const monthlyCodingScore = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[3]/div/div/span[2]")?.textContent;
    // const languagesUsed = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[1]//div[text()='Language Used']")?.nextElementSibling.textContent.split(",");
    // const totalProblemSolved = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[1]/div/div[3]/div/div[2]/div[2]/div/div/span[2]")?.textContent;
    // const school = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[1]/a")?.textContent.replace(/\D/g, "");
    // const basic = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[2]/a")?.textContent.replace(/\D/g, "");
    // const easy = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[3]/a")?.textContent.replace(/\D/g, "");
    // const medium = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[4]/a")?.textContent.replace(/\D/g, "");
    // const hard = getElementByXpath(document, "/html/body/div[6]/div/div[2]/div[4]/div[1]/div/ul/li[5]/a")?.textContent.replace(/\D/g, "");


    res.status(200).json({
        status: "success",
        data:{

        }
    })

});
