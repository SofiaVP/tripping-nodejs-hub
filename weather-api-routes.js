var express = require('express');
const request = require('request');
const apiRouter = express.Router();
const fetch = require("node-fetch");
require('dotenv').config();


var myGenericMongoClient = require('./my_generic_mongo_client');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY



// //const fetch = require("node-fetch");
// //const url = "https://jsonplaceholder.typicode.com/posts/1";

// const getData = async url => {
// 	try {
// 	  const response = await fetch(url);
// 	  const json = await response.json();
// 	  //console.log(json);
// 	  //exports json = json;
// 	  //res.send(json)
// 	} catch (error) {
// 	  console.log(error);
// 	}
//   };



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


// JUST GET CURRENT WEATHER FROM API 
// exemple URL:http://localhost:8282/weather-api/current/Toulouse
apiRouter.route('/weather-api/current/:name')
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

// GET 7 DAYS FORCAST WEATHER FROM API with coord
// exemple URL:http://localhost:8282/weather-api/forcast/48.85/2.35
apiRouter.route('/weather-api/forcast/:lat/:lon')
.get(async function(req, res, next){
	var lat = req.params.lat; 
	var lon = req.params.lon;
	console.log(WEATHER_API_KEY);
	const url = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=current,minutely,hourly&APPID="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	res.send(json)
})


// GET 7 DAYS FORCAST WEATHER FROM API with cityname
// exemple URL:http://localhost:8282/weather-api/forcast/paris
apiRouter.route('/weather-api/forcast/:cityname')
.get(async function(req, res, next){
	var cityname = req.params.cityname; 
	const url = "http://api.openweathermap.org/data/2.5/forecast?q="+cityname+"&appid="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	const count = json.cnt;
	console.log(count)
	const forcastPretty = []; 
	for(i=0; i<count; i++){
		const weather = {
			date: json.list[i].dt_txt,
			temp: json.list[i].main.temp,
			feels_like: json.list[i].main.feels_like, 
			icon: json.list[i].weather[0].icon
		}
		forcastPretty.push(weather);
	}
	res.send(forcastPretty);		
})


// GET current weather from api + save in mongo 
// exemple URL: http://localhost:8282/weather-api/public/weather/nyon
apiRouter.route('/weather-api/public/weather/:name')
.post(async function(req, res, next){
	console.log("+++++++++++++++ Dans methode get and save current weather+++++++++++++++++++++++")
	var cityName = req.params.name;
	
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid="+WEATHER_API_KEY+"&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	//const jsont = await json.name();  
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
//exemple URL: http://localhost:8282/weather-api/public/weather/Paris
apiRouter.route('/weather-api/public/weather/:name')
.get( function(req , res  , next ) {
	var cityName = req.params.name;
	myGenericMongoClient.genericFindOne(/*'devises'*/ 'mockweathercollection',
										{ 'name' : cityName },
									    function(err,meteo){
										   res.send(/*replace_mongoId_byCode*/meteo);
									   });
	
});


exports.apiRouter = apiRouter;