## CorsicaWX
##### A Better Weather Page for Corsica Digital Sign Servers 


    Sadly, Apple acquired Dark Sky and disabled the Dark Sky API.

    On my do-to list is making a similar page that works with the [Open Weather Map API](https://openweathermap.org/api) 
    for Corsica and [Screenly OSE](https://www.screenly.io/) digital sign servers.


[Corsica](https://github.com/mozilla/corsica-cli) digital sign servers have frequently used the forecast.io weather widget in full screen mode to display local weather information.  

![Sample Images](https://raw.githubusercontent.com/RAMilewski/CorsicaWx/master/images/CorsicaWxSample.png)



CorsicaWx uses the same Dark Sky API as the forecast.io widget, but is fully configurable.  For example:

  * The default background image is configurable.
  * Background images can be selected by location and/or by weather condition (rain, snow, etc).
  * Random selection from a set of images for a given location or weather condition is supported.
  * The code is easy to modify to inclue any of the data points from Dark Sky that are not shown on the forecast.io widget.
  * Background image file names are specified in an array in the backgroundCatalog module to make it easy to change image sets for different use cases.

CorsicaWx uses a proxy running the SimpleSky API wrapper around the Dark Sky API to conceal the confidential API keys.   See [WxProxy](https://github.com/RAMilewski/WxProxy) for a Node.js proxy using Express. 

###### Known Issues
  * The code works properly only for forecasts in English. Please fork localized implementations, so we can link to them from here.
    


  







