var express = require('express');
const request = require('request');
const apiRouter = express.Router();
const fetch = require("node-fetch");
require('dotenv').config();


var myGenericMongoClient = require('./my_generic_mongo_client');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY 

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
function replace_mongoId_byCode(meteo){
	meteo.name = meteo._id;
	delete meteo._id; 
	return meteo;
}

function replace_mongoId_byCode_inArray(meteoArray){
	for(i in meteoArray){
		replace_mongoId_byCode(meteoArray[i]);
	}
	return meteoArray;
}
//+++++++++++++++++++++++++++++++++++++++++++++//

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//+++++++++++++++++++ ONLY EXTERNAL API  ++++++++++++++++++++++++++//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

// GET 7 DAYS forecast WEATHER FROM API with cityname
// exemple URL:http://localhost:8282/weather-api/public/forecastbycity/paris
apiRouter.route('/weather-api/public/forecastbycity/:cityname')
.get(async function(req, res, next){
	var cityname = req.params.cityname; 
	const url = "http://api.openweathermap.org/data/2.5/forecast?q="+cityname+"&appid="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	const count = json.cnt;
	const forecastPretty = []; 
	for(i=0; i<count; i+=8){
		const weather = {
			city: json.city.name,
			date: json.list[i].dt_txt,
			temp: json.list[i].main.temp,
			feels_like: json.list[i].main.feels_like, 
			icon: json.list[i].weather[0].icon
		}
		forecastPretty.push(weather);
	}
	res.send(forecastPretty);		
})


// GET CURRENT WEATHER FROM API 
// exemple URL:http://localhost:8282/weather-api/public/current/Toulouse
apiRouter.route('/weather-api/public/current/:name')
.get(async function(req, res, next){
	var name = req.params.name; 
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+name+"&appid="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	res.send(
		{
			name: json.name, 
			dt: json.dt, 
			temp: json.main.temp,
			feels_like: json.main.feels_like,   
			sunrise: json.sys.sunrise, 
			sunset: json.sys.sunset
		 })
})

// GET 7 DAYS forecast WEATHER FROM API with coord
// exemple URL:http://localhost:8282/weather-api/forecastByCoords/48.85/2.35
apiRouter.route('/weather-api/forecastByCoords/:lat/:lon')
.get(async function(req, res, next){
	var lat = req.params.lat; 
	var lon = req.params.lon;
	console.log(WEATHER_API_KEY);
	const url = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=current,minutely,hourly&APPID="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	res.send(json)
})




//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//+++++++++++++++ EXTERNAL WEATHER API + MONGO  +++++++++++++++++++//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

// GET current weather from api + post in mongo 
// exemple URL: http://localhost:8282/weather-api/public/mongo/weather/Madrid
apiRouter.route('/weather-api/public/mongo/weather/:name')
.post(async function(req, res, next){
	console.log("+++++++++++++++ Dans methode get and save current weather+++++++++++++++++++++++")
	var cityName = req.params.name;
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();

	myGenericMongoClient.genericInsertOne('mockweathercollection', json,function(err,meteo){res.send(
		{
			name: json.name, 
			dt: json.dt, 
			temp: json.main.temp,
			feels_like: json.main.feels_like,   
			sunrise: json.sys.sunrise, 
			sunset: json.sys.sunset
		 })} )
} )


//GET weather from city in mongo 
//exemple URL: http://localhost:8282/weather-api/mongo/getweather/Toulouse
apiRouter.route('/weather-api/mongo/getweather/:name')
.get( function(req , res  , next ) {
	var cityName = req.params.name;
	myGenericMongoClient.genericFindOne(/*'devises'*/ 'mockweathercollection',
										{ 'name' : cityName },
									    function(err,meteo){
										   res.send(/*replace_mongoId_byCode*/meteo);
									   });
	
});


exports.apiRouter = apiRouter;