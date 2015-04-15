//Declare npm module dependencies 
var express = require('express');
var app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('forum.db');

var ejs = require('ejs');
app.set('view_engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

//declare port that it operates on
var port = 3000;

//declare primary redirect for home. 
app.get('/', function(req, res){
	res.redirect('/forum')
})


//listen and startup log
app.listen(3000);
console.log("I've started!");