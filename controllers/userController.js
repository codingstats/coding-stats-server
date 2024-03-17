const User = require("../model/userModel");
const CodingProfile = require("../model/codingProfileModel");
const catchAsync = require("../util/catchAsync");
const axios = require("axios");
const AppError = require("../util/appError");

exports.addCodingPlatform = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.user._id).populate('codingPlatforms');

    const requestedPlatformName = req.body.platformName;
    const requestedPlatformHandler = req.body.platformHandler;

    //this will throw error if coding platform is invalid
    //platform id will be inserted after verification if exists
    const codingProfile = await CodingProfile.create({
        platformName: requestedPlatformName, platformHandler: requestedPlatformHandler, platformUserId: 0
    });

    //check if there is such user on actual coding platform
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
    await CodingProfile.findOneAndUpdate(codingProfile, {platformUserId: response.data.userId});

    let prevPlatform = -1;
    //check if user has that platform already listed
    //if yes delete it
    let i = -1;
    for (const cp of user.codingPlatforms) {
        i++;
        if (cp.platformName === requestedPlatformName) {
            prevPlatform = i;
            await CodingProfile.findOneAndDelete(prevPlatform, {runValidators: false});
            break;
        }
    }

    if (prevPlatform !== -1) user.codingPlatforms.splice(prevPlatform, 1);

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


exports.deleteMe = catchAsync(async (req, res, next) => {
    //1. get user from the collection
    let user = await User.findById(req.user._id).select('+password');

    //2. check if posted password is correct
    if (!user || !req.body.password || !(await user.correctPassword(req.body.password, user.password))) {
        return next(new AppError("Incorrect password!", 401));
    }

    //delete the platformsFor that user
    for (const platform of user.codingPlatforms) {
        await CodingProfile.findOneAndDelete(platform);
    }

    //delete the user
    await User.findByIdAndDelete(req.user._id);


    //we won't see the response in postman as status code is 204
    res.status(204).json({
        status: 'success', message: "User deleted!", data: null
    });

});