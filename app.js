//requires

var express	= require('express'), app = express();
var fs		= require('fs');
var crypt 	= require('crypto');
var Q 		= require('q');
var redis	= require('redis');

//localization

var serverRoot = require('path').dirname(require.main.filename);

//routes

app.get('/',home);
app.post('/addPage',postPage);
app.get('/:page',getPage);

app.listen(8080);

//handle routes

function home(req,res){
	res.send('hi');
}

function postPage(req,res){
	createURL(6)
		.then(savePage)
		.then(success, error);
		
	function savePage(){
		return pretendAsync();
	}
		
	function success(data){
		res.send(data);
	}
	function error(err){
		res.send('error');
	}
		
}

function getPage(req,res){
	loadPage(req.params.page)
		.then(success, error);
		
	function loadPage(url){
		console.log(url);
		return pretendAsync();
	}
	function success(data){
		res.send(data);
	}
	function error(err){
		res.send('error');
	}
}

//generate Random Base64 string of length

function createURL(len){
	var deferred = Q.defer();
	crypt.randomBytes(len, function(err, buf) {
		if(err) deferred.reject(err);
		var token = buf.toString('hex');
		deferred.resolve(token)
	});	
	return deferred.promise
}

//createURL(6).then(console.log,console.log);

//this is to fake async code to test promises.
function pretendAsync(){
	var deferred = Q.defer();
	setTimeout(function(){deferred.resolve('hai')},1000);
	return deferred.promise
}