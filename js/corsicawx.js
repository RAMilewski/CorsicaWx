'use strict';

const wxproxy = 'https://corsica.netfools.com/wxproxy';
const skyconPath = "./images/skycons/";
const skyconType = ".png";
const imagePath = "./images/";
let   allowWxOverride = true;   //True allows override of location images for some wx condx.
import {pictures} from "./imageCatalog.js";


let lat, lng, title = null;
let params = (new URL(document.location)).searchParams;
let geo = params.get('geo'); // Geolocation (lat|lng|title)
if (geo !== null) {
    lat = geo.split('|')[0];
    lng = geo.split('|')[1];
    title = geo.split('|')[2];
}

const choosePic = topic => {   
    let row = pictures.find(row => row[0] == topic);
    if (row != null) {
        const index = Math.floor(Math.random() * (row.length - 1)) + 1; 
        document.body.style.backgroundImage = `url(${imagePath}${row[index]})`;
    } else {
        choosePic("default");
        allowWxOverride = true;  //No location image so we can always override
    }
};

choosePic(title);   // If we have location-related background images for this location use one, otherwise use the default.

const rephrase = text => {
    let regex = '/throughou\sthe/gi';  // There's clearly something about text.replace I don't understand.
    text = text.replace('throughout the', 'all');
    regex = "/high\stemperatures/gi";
    text = text.replace('high temperatures', 'highs');
    regex = "/low\stemperatures/gi";
    text = text.replace('low temperatures', 'lows');
    return text;
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
    ** Default Units **
    Summaries containing temperature or snow accumulation units will have their values in degrees Celsius or in centimeters (respectively).
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

    switch (wx.flags.units) {  // Overrides of default units 
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
            console.log('Error: unknown units requested');
    }
    
    //If we allow WxOverrides and we have images for this wx condx, use one.
    if (allowWxOverride && pictures.find(row => row[0] == wx.currently.icon)) { choosePic(wx.currently.icon); }
    
    document.getElementById('title').innerText = title;
    document.getElementById('skyconPrime').src = `${skyconPath}${wx.currently.icon}.png`;
    document.getElementById('temp0').innerText = `${Math.round(wx.currently.temperature)}`;
   
    document.getElementById('tempScale').innerText = tempScale;
    document.getElementById('humidity').innerText = `Humidity: ${parseInt(wx.currently.humidity * 100)}%`;
    if (wx.currently.apparentTemperature > wx.currently.Temperature + 1) {
    document.getElementById('heatIndex').innerText = `Heat Index: ${Math.round(wx.currently.apparentTemperature)}`;
    }
    if (wx.currently.uvIndex > 0.5) {
        document.getElementById('uvIndex').innerText = `UV Index: ${Math.round(10 * wx.currently.uvIndex)/10}`;
    }
    
    if (wx.alerts) {document.getElementById("alert").innerText = (wx.alerts[0].title);}
    document.getElementById("summary").innerText = rephrase(wx.hourly.summary);
    

    let compass = compasspoint(wx.currently.windBearing);
    document.getElementById("windSpeed").innerText = `Wind from the ${compass} at ${Math.round(wx.currently.windSpeed)} mph ` ;
    if ((wx.currently.windGust)-2 > wx.currently.windSpeed) {
        document.getElementById("gust").innerText = `gusting to ${Math.round(wx.currently.windGust)} mph`;
    }
    
    document.getElementById("summary2").innerText = rephrase(wx.daily.summary);

    for (let day = 0 ; day < 8 ; day++ ) {   //  Fill in the daily data across the bottom. 

        let weekDay = weekday(wx.daily.data[day].time); 
    
        if (!day) {
            document.getElementById(`weekday-${day}`).innerText = "Today";
        } else {
            document.getElementById(`weekday-${day}`).innerText = weekday(wx.daily.data[day].time);
        }
        
        document.getElementById(`skycon-${day}`).src = `${skyconPath}${wx.daily.data[day].icon}${skyconType}`;

        let highTemp = Math.round(wx.daily.data[day].temperatureHigh);
        let daysTemp = document.getElementById(`highTemp-${day}`);
        if ((tempScale == "F" && highTemp > 90) || (tempScale == "C" && highTemp > 32)) {
            daysTemp.classList.add("heatwave");
            daysTemp.style.color = "#FF0E18";
        } 
        daysTemp.innerText = `${Math.round(wx.daily.data[day].temperatureHigh)}`;
        
        document.getElementById(`lowTemp-${day}`).innerText = `${Math.round(wx.daily.data[day].temperatureLow)}`;
    }

    // All will be revealed in the main salon at midnight.
    document.getElementById('forecast').style.visibility = "visible";
});