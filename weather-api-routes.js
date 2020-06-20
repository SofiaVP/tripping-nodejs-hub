var express = require('express');
const request = require('request');
const apiRouter = express.Router();
const fetch = require("node-fetch");

var myGenericMongoClient = require('./my_generic_mongo_client');


//const fetch = require("node-fetch");
//const url = "https://jsonplaceholder.typicode.com/posts/1";

const getData = async url => {
	try {
	  const response = await fetch(url);
	  const json = await response.json();
	  //console.log(json);
	  //exports json = json;
	  //res.send(json)
	} catch (error) {
	  console.log(error);
	}
  };



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
// exemple URL: http://localhost:8282/weather-api/current/toulouse
apiRouter.route('/weather-api/current/:name')
.get(async function(req, res, next){
	var name = req.params.name; 
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+name+"&appid=2d0c2252a4bc29b72d473be3efad81e1&units=metric";
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

	
	// const getData = async url => {
	// 	try {
	// 	  const response = await fetch(url);
	// 	  const json = await response.json();
	// 	  console.log(json);
	// 	  //exports json = json;
	// 	  res.send(json)
	// 	} catch (error) {
	// 	  console.log(error);
	// 	}
	//   };
	
	//const weatherres = await getData(url);
	//res.send(weatherres);
	//console.log(weatherres);
	// const response = await fetch(url);
	// const json = await response.json();
	// console.log(json);
	// res.send(json
	// 	// {
	// 	// 	name: json.name, 
	// 	// 	dt: json.dt, 
	// 	// 	temp: json.main.temp,
	// 	// 	feels_like: json.main.feels_like,   
	// 	// 	sunrise: json.sys.sunrise, 
	// 	// 	sunset: json.sys.sunset
	// 	//  }
	// 	)

})



// GET current weather from api + save in mongo 
// exemple URL: http://localhost:8282/weather-api/public/weather/nyon
apiRouter.route('/weather-api/public/weather/:name')
.post(async function(req, res, next){
	console.log("+++++++++++++++ Dans methode get and save current weather+++++++++++++++++++++++")
	var cityName = req.params.name;
	
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid=2d0c2252a4bc29b72d473be3efad81e1&units=metric";
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