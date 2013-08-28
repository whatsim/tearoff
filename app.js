//requires

var express	= require('express'), app = express();
var fs		= require('fs');
var crypt 	= require('crypto');
var Q 		= require('q');
var redis	= require('redis'), client = redis.createClient();

//express conf

app.use(express.bodyParser());

//localization

var serverRoot = require('path').dirname(require.main.filename);

//routes

app.get('/',getHome);
app.post('/addPage',postPage);
app.get('/:page',getPage);

app.listen(8080);

//handle routes

function getHome(req,res){
	res.send('hi');
}

function postPage(req,res){
	createURL(4)
		.then(savePage)
		.then(success, error);
		
	function savePage(data){
		var deferred = Q.defer();
		var o = {
			body : req.body.text
		}
		client.set(data,JSON.stringify(o),function (err, reply){
			if(err) deferred.reject('failed to save');
			deferred.resolve(data);
		});
		return deferred.promise
	}
		
	function success(data){
		res.send(data);
	}
	function error(err){
		res.send(err);
	}
		
}

function getPage(req,res){
	loadPage(req.params.page)
		.then(success, error);
		
	function loadPage(url){
		var deferred = Q.defer();
		client.get(url,function (err, reply){
			if(err) deferred.reject('no such bulletin');
			deferred.resolve(reply);
		});
		return deferred.promise
	}
	function success(data){
		res.send(data);
	}
	function error(err){
		res.send(err);
	}
}

//generate Random string of length

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
	setTimeout(function(){deferred.resolve('hai')},10);
	return deferred.promise
}