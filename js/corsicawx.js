'use strict';

const wxproxy = 'https://corsica.netfools.com/wxproxy';
const skyconPath = "./graphics/skycons/";
const backgroundPath = "./graphics/images/";
let   allowWxOverride = true;


const pictures = [
    ["default","clouds001.jpg"],
    ["rain", "rain001.gif", "rain002.gif", "rain003.gif"],
    ["snow","clouds001.jpg"],
    ["sleet","clouds001.jpg"],
    ["fog","clouds001.jpg"],
    ["Salem", "Salem001.jpg", "Salem002.jpg", "Salem003.jpg"],
    ["McMenamins Edgefield", "Edgefield001.jpg"],
    ["Riverfront Park", "salem-riverfront-park-3.jpg", "salem-riverfront-park-4.jpg"],
    ["Multnomah Falls", "Falls2.gif", "Falls3.gif"]
];


//Test Data
let lat = 45.537;
let lng = -122.406;
let title = "Salem";


lat = 45.577464;
lng = -122.117356; 
title = "Multnomah Falls";

lat = 40.266664
lng = -94.031231
title = "Bethany Missouri"


let params = (new URL(document.location)).searchParams;
let geo = params.get('geo'); // Geolocation (lat|lon|title)
if (geo !== null) {
    lat = geo.split('|')[0];
    lng = geo.split('|')[1];
    title = geo.split('|')[2];
}

const choosePic = topic => {
    const row = pictures.find(row => row[0] == topic);
    if (row) 
        {const index = Math.floor(Math.random() * (row.length - 1)) + 1; 
        return row[index];
    } else {
        return null;
    }

};

if (choosePic(title)) {
    document.body.style.backgroundImage = `url(${backgroundPath}${choosePic(title)}`;
} else {
    document.body.style.backgroundImage = `url(${backgroundPath}${choosePic("default")}`;
    allowWxOverride = true;

}

const compasspoint = bearing => {
    let allpoints = ['North','NE','East','SE','South','SW','West','NW','North'];
    return allpoints[Math.round(((bearing+22.5)/22.5)/2)];
}

const weekday = timestamp => {
    const theday = new Date(timestamp * 1000);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    return dayNames[theday.getDay()];
}

fetch(`${wxproxy}/${lat}/${lng}/minutely`)  //Call the Dark Sky API proxy
.then(function(response) {
    return response.json();
})
.then(function(wx) {
    
/*
    summary: Any summaries containing temperature or snow accumulation units will have their values in degrees Celsius or in centimeters (respectively).
    nearestStormDistance: Kilometers.
    precipIntensity: Millimeters per hour.
    precipIntensityMax: Millimeters per hour.
    precipAccumulation: Centimeters.
    temperature: Degrees Celsius.
    temperatureMin: Degrees Celsius.
    temperatureMax: Degrees Celsius.
    apparentTemperature: Degrees Celsius.
    dewPoint: Degrees Celsius.
    windSpeed: Meters per second.
    pressure: Hectopascals.
    visibility: Kilometers.
*/

    let tempScale = 'C';
    let windSpeed = 'm/sec';
    let baroScale = 'HPa';
    let distance = 'km';
    let precipRate = 'mm/hr';
    let snow = 'cm';
    
    switch (wx.flags.units) {
        case 'us' :
            tempScale = 'F';
            windSpeed = 'mph';
            baroScale = 'in Hg';
            distance = 'mi.';
            precipRate = 'in/hr';
            snow = 'in';
        break;
        case 'ca' : 
            windSpeed = 'km/hr';
        break;
        case 'uk2':
            windSpeed = 'mph';
            distance = "mi.";
        default:
            console.log('Error: unknown units');

    }
    
    //Wx-driven Background Image Override
    if (allowWxOverride) {
        if (wx.currently.icon == "rain" | "snow" | "sleet" ) {
            document.body.style.backgroundImage = `url(${backgroundPath}${choosePic(wx.currently.icon)}`;
        }
    }
    
    document.getElementById('title').innerText = title;
    document.getElementById('skyconPrime').src = `${skyconPath}${wx.currently.icon}.png`;
    document.getElementById('temp0').innerText = `${Math.round(wx.currently.temperature)}`;
   
    document.getElementById('tempScale').innerText = tempScale;
    if (wx.currently.apparentTemperature > wx.currently.Temperature + 1) {
    document.getElementById('heatIndex').innerText = `Heat Index: ${Math.round(wx.currently.apparentTemperature)}`;
    }
    if (wx.currently.uvIndex > 0.5) {
        document.getElementById('uvIndex').innerText = `UV Index: ${Math.round(10 * wx.currently.uvIndex)/10}`;
    }
    
    document.getElementById("summary").innerText = wx.hourly.summary;
    

    let compass = compasspoint(wx.currently.windBearing);
    document.getElementById("windSpeed").innerText = `Wind from the ${compass} at ${Math.round(wx.currently.windSpeed)} mph ` ;
    if ((wx.currently.windGust)-2 > wx.currently.windSpeed) {
        document.getElementById("gust").innerText = `gusting to ${Math.round(wx.currently.windGust)} mph`;
    }
    // document.getElementById("summary2").innerText = wx.daily.summary;

    for (let day = 0 ; day < 8 ; day++ ) {   //  Fill in the daily data across the bottom. 

        let weekDay = weekday(wx.daily.data[day].time);
    
        if (!day) {
            document.getElementById(`weekday-${day}`).innerText = "Today";
        } else {
            document.getElementById(`weekday-${day}`).innerText = weekday(wx.daily.data[day].time);
        }
        document.getElementById(`skycon-${day}`).src = `${skyconPath}${wx.daily.data[day].icon}.png`;
        document.getElementById(`highTemp-${day}`).innerText = `${Math.round(wx.daily.data[day].temperatureHigh)}`;
        document.getElementById(`lowTemp-${day}`).innerText = `${Math.round(wx.daily.data[day].temperatureLow)}`;
    }

    document.getElementById('forecast').style.visibility = "visible";

});