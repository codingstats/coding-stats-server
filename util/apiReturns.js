const axios = require("axios");

//only keeps allowedFields in obj
const filterObj = (obj, allowedFields) => {
    // console.log(obj)
    // console.log(Object.keys(obj))
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.wikiBriefs = async (q, topk) => {
    console.log(`wikibrief: ${q}`);
    const options = {
        method: 'GET', url: 'https://wiki-briefs.p.rapidapi.com/search', params: {
            q: `${q}`, topk: `${topk}`
        }, headers: {
            'X-RapidAPI-Key': process.env.RAPID_KEY, 'X-RapidAPI-Host': 'wiki-briefs.p.rapidapi.com'
        }
    };

    const response = await axios.request(options);
    facts = response.data.summary;
    facts = facts.filter(fact => fact.indexOf("<!") === -1);
    response.data.summary = facts;
    return response;
};

exports.getWikiExtracts = async (title) => {
    console.log(`wikiExtract: ${title}`);
    return await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&continue=&format=json&formatversion=2&pithumbsize=500&titles=${title}`);
};

exports.getCelestialPhysicalData = async (body) => {
    const toKeep = {
        semimajorAxis: "km",
        perihelion: "km",
        aphelion: "km",
        eccentricity: "km",
        inclination: "°",
        density: "g.cm<sup>3</sup>",
        gravity: "m.s<sup>-1</sup>",
        escape: "m.s<sup>-1</sup>",
        meanRadius: "km",
        equalRadius: "km",
        polarRadius: "km",
        axialTilt: "°",
        avgTemp: "K",
        moons: "",
        mass: "kg",
        vol: "kg<sup>3</sup>",
        aroundPlanet: "",
        englishName: ""
    }
    const response = await axios.get(`https://api.le-systeme-solaire.net/rest/bodies/${body}`);
    let data = response.data;
    //api sometime is returning invalid json data
    if (typeof data === 'string') {
        data = data.replace(/:,/g, ':null,');
        data = JSON.parse(data);
    }
    data = filterObj(data, Object.keys(toKeep));
    const moons = [];
    for (const moon of data.moons || []) {
        moons.push(moon.moon);
    }
    data.moons = moons.length > 0 ? moons : undefined;
    data.aroundPlanet = data.aroundPlanet?.planet || undefined;
    data.mass = data.mass && `${data.mass?.massValue}×10<sup>${data.mass?.massExponent}</sup>`;
    data.vol = data.vol && `${data.vol?.volValue}×10<sup>${data.vol?.volExponent}</sup>`;
    for (const property of Object.keys(data)) {
        data[property] = data[property] ? `${data[property]} ${toKeep[property]}` : undefined;
    }
    response.data = data;
    return response;
};

exports.getPeopleInISS = async () => {
    return await axios.get('http://api.open-notify.org/astros.json');
}

exports.getMarsRoverAdditionalData = async () => {
    return [{
        rover: "Sojourner (NASA)", launch: "December 4, 1996", landing: "July 4, 1997", duration: "83 days"
    }, {
        rover: "Spirit (NASA)",
        launch: "June 10, 2003",
        landing: "January 4, 2004",
        duration: "Operated until March 22, 2010"
    }, {
        rover: "Opportunity (NASA)",
        launch: "July 7, 2003",
        landing: "January 25, 2004",
        duration: "Operated until June 10, 2018"
    }, {
        rover: "Curiosity (NASA)", launch: "November 26, 2011", landing: "August 5, 2012", duration: "Ongoing Mission"
    }, {
        rover: "Perseverance (NASA)", launch: "July 30, 2020", landing: "February 18, 2021", duration: "Ongoing Mission"
    },]
};

exports.getMarsImages = async (date) => {
    const response = await axios(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${date}&api_key=${process.env.NASA_KEY}`);
    const photos = response.data.photos;
    const photosToReturn = [];
    for (const photo of photos) {
        const inDatabase = photosToReturn.map(obj => obj.img_src.split("_").slice(1).join("_"));
        const newImageSrc = photo.img_src.split("_").slice(1).join("_");
        if (inDatabase.indexOf(newImageSrc)<0) {
            const toAdd = {};
            toAdd.id = photo.id;
            toAdd.roverName = photo.rover.name;
            toAdd.camera = photo.camera.full_name;
            toAdd.img_src = photo.img_src;
            photosToReturn.push(toAdd);
        }
    }
    return photosToReturn;
};

