var express = require('express');
const request = require('request');
const apiRouter = express.Router();

var myGenericMongoClient = require('./my_generic_mongo_client');

// var nodefetch = require('/node-fetch')




//++++++++++++++++++++++ HELP++++++++++++++++++++++++++++++++++++++//
//+++++++++++++ ça fait quoi ces 2 fonctions??+++++++++++++++++++++//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
function replace_mongoId_byCode(meteo){
	meteo.name = meteo._id;
	delete meteo._id; 
	return meteo;
}

function replace_mongoId_byCode_inArray(deviseArray){
	for(i in deviseArray){
		replace_mongoId_byCode(deviseArray[i]);
	}
	return deviseArray;
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//


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


// GET weather from api + save in mongo 
// exemple URL: http://localhost:8282/weather-api/public/weather/nyon
apiRouter.route('/weather-api/public/weather/:name')
.post(async function(req, res, next){
	var cityName = req.params.name;
	const fetch = require("node-fetch");
	const url = "http://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid=2d0c2252a4bc29b72d473be3efad81e1&units=metric";
	const response = await fetch(url);
	const json = await response.json();
	myGenericMongoClient.genericInsertOne('mockweathercollection', json,function(err,meteo){res.send(json)} )
} )

exports.apiRouter = apiRouter;