// requires

var fs		= require('fs');
var express	= require('express'), app = express();
var jade	= require('jade');
var Q 		= require('q');
var db		= require('redisDriver');
var sha1	= require('sha1');

// express conf

app.use(express.bodyParser());

// localization

var serverRoot = require('path').dirname(require.main.filename);

var fPageObj = {
	text	:	'copy goes here',	// the message. markdown likely
	expires	:	-1,					// time the message is no longer accessible (only deleted if actually accessed after that time?)
	loads	:	10,					// number of allowed loads
	visitors : [],					// hash of ip to remember them by
	strict : true					// repeated loads from one user deplete the count
}

// routes

app.get('/',getHome);
app.get('/:page',getPage);

// rest routes should go here

app.get('/peek/:page',getPeek);
app.post('/addPage',postPage);

app.listen(8080);

// handle routes

function getHome(req,res){
	res.send('hi');
}

function postPage(req,res){
	db.savePage(fPageObj).then(success, error);
		
	function success(url){
		var o = {
			status : 200,
			url : url	
		}
		res.send(JSON.stringify(o));
	}
	function error(err){
		var o = {
			status : 500,
			error : err
		}
		res.send(JSON.stringify(o),500);
	}
		
}

function getPage(req,res){
	db.loadPage(req.params.page)
		.then(loaded, error);
	
	function loaded(data){
		if(data.strict){
			data.loads --;
		} else {
			var ipHash = sha1(req.ip);
			
			if(data.vistors.indexOf(ipHash) < 0){
				data.vistors.push(ipHash);
				data.loads --;
			}
		}
		console.log('hello');
		if((1*data.loads) > 0){
			
			db.updatePage(req.params.page,data)
				.then(success,error)	
		} else {
			
			db.deletePage(req.params.page,data)
				.then(success,error)	
		}
	
	}
	
	function success(reply){
		res.send(reply);
	}
	
	function error(err){
		res.send(err);
	}
}

function getPeek(req,res){
	db.loadPage(req.params.page)
		.then(success, error);
	
	function success(data){
		res.json(data);
	}
	function error(err){
		res.json(err);
	}
}
