const User = require("../model/userModel");
const CodingProfile = require("../model/codingProfileModel");
const catchAsync = require("../util/catchAsync");
const axios = require("axios");

exports.addCodingPlatform = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.user._id).populate('codingPlatforms');

    const requestedPlatformName = req.body.platformName;
    const requestedPlatformHandler = req.body.platformHandler;

    //check if user has that platform already listed
    for (const cp of user.codingPlatforms) {
        if (cp.platformName === requestedPlatformName) {
            res.status(400).json({
                status: "fail", message: "Platform already exist!"
            });
            return;
        }
    }

    //this will throw error if coding platform is invalid
    //platform id will be inserted after verification if exists
    const codingProfile = await CodingProfile.create({
        platformName: requestedPlatformName, platformHandler: requestedPlatformHandler, platformUserId: 0
    });

    const validatingURL = `${req.protocol}://${req.get('host')}/${requestedPlatformName.toLowerCase()}/validateUser/${requestedPlatformHandler}`;
    let response;

    try {
        response = await axios.get(validatingURL);
        if (response.status !== 200) throw new Error("User does not exist!");
    } catch (e) {
        await CodingProfile.findOneAndDelete(codingProfile);
        res.status(400).json({
            status: "fail", message: "User does not exist!"
        });
        return;
    }

    console.log(response.data);

    await CodingProfile.findOneAndUpdate(codingProfile, {platformUserId: response.data.userId});

    user.codingPlatforms.push(codingProfile);
    await user.save({validateBeforeSave: false});
    user = await User.findOne(user).populate("codingPlatforms");

    res.status(200).json({
        status: 'success', message: `${requestedPlatformName} added to profile!`, data: user
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const username = req.params.username;
    //email shall not be displayed

    let user;

    if (req.user && req.user.username === username) user = await User.findOne({username}).populate("codingPlatforms"); else user = await User.findOne({username}).select("-email").populate("codingPlatforms");

    if (!user) {
        res.status(400).json({
            status: "fail", message: "No such user"
        });
    }

    res.status(200).json({
        status: 200, data: {
            user
        }
    })
});
