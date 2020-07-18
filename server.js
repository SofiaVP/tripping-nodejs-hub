var express = require('express');

////////////////++++++++++++++++++/////////////////////
var weatherApiRoutes = require('./weather-api-routes');
//var produitApiRoutes = require('./produit-api-routes');
var bodyParser = require('body-parser');
var app = express();

app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
//ou avec "www.xyz.com" à la place de "*" en production
res.header("Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Accept");
next();
});

//app.use(express.static('./dist/my-node-server'));
// app.get('/*', function (request, response) {
//     response.sendFile(path.join(__dirname, '/html/index.html'));
// });


//support parsing of JSON post data
var jsonParser = bodyParser.json() ;
app.use(jsonParser);

//les routes en /html/... seront gérées par express
//par de simples renvois des fichiers statiques du répertoire "./html"
app.use('/html', express.static(__dirname+"/html"));


app.get('/', function(req , res ) {
res.redirect('/html/index.html');
});

/////////+++++++++++++++++++++++++++////////////////////
app.use(weatherApiRoutes.apiRouter); //delegate REST API routes to apiRouter(s)
//app.use(produitApiRoutes.apiRouter); 

// app.listen(8282 , function () {
// console.log("http://localhost:8282");
// });

app.listen(process.env.PORT || 8282);