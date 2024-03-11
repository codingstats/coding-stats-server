const axios = require("axios");

//any external API will be called using functions listed here

//response in this function contains html page as string, there in a function within script
//where heatmapData is present as text, that heatmap data will be extracted using regex and returned
exports.getGfgHeatmap = async (username, userid, year) => {
    if (year === new Date().getFullYear()) year = -1;
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

    return heatmapData;
}

