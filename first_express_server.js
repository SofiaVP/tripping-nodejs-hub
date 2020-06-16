//modules to load:
var express = require('express');
var app = express();
app.get('/', function(req, res , next) {
res.setHeader('Content-Type', 'text/html');
res.write("<html> <body>");
res.write('<p>index (welcome page) of simpleApp</p>');
res.write('<a href="addition?a=5&b=6">5+6</a>');
res.write("</body></html>");
res.end();
});
//GET addition?a=5&b=6
app.get('/addition', function(req, res , next) {
a = Number(req.query.a); b = Number(req.query.b);
resAdd = a+b;
res.setHeader('Content-Type', 'text/html');
res.write("<html> <body>");
res.write('a=' + a + '<br/>'); res.write('b=' + b + '<br/>');
res.write('a+b=' + resAdd + '<br/>');
res.write("</body></html>");
res.end();
});
app.listen(8282 , function () {
console.log("simple express node server listening at 8282");
});