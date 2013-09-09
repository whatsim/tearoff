// requires

var fs		= require('fs');
var express	= require('express'), app = express();
var jade	= require('jade');
var Q 		= require('q');
var db		= require('redisDriver');
var sha1	= require('sha1');

// express conf

var serverRoot = require('path').dirname(require.main.filename);

app.use(express.bodyParser());
app.set('views', serverRoot + '/views');
app.set('view engine', 'jade');

// dummy page object to insert

var fPageObj = {
	text	:	'copy goes here',	// the message. markdown likely
	expires	:	-1,					// time the message is no longer accessible (only deleted if actually accessed after that time?)
	loads	:	10,					// number of allowed loads
	visitors : [],					// hash of ip to remember them by
	strict : true					// repeated loads from one user deplete the count
}

// main routes

app.get('/',getHome);
app.get('/:page',getPage);

// rest routes should go here

app.get('/peek/:page',getPeek);
app.post('/postPage',postPage);

// asset routes

app.get('/assets/:type/:name',getFile);

app.listen(8080);

// handle routes

function getHome(req,res){
	page = {
		'page' : {
			'title' : 'home'
		}
	};
	res.render('home',page);
}

function postPage(req,res){
	
	// pageText
	// loads
	// strict
	
	o = {
		pageText : req.body.pageText,
		loads : req.body.loads,
		strict : req.body.strict,
		vistors : []
	};
	
	db.savePage(o).then(success, error);
		
	function success(url){
		var o = {
			status : 200,
			url : url	
		}
		res.json(o);
	}
	function error(err){
		var o = {
			status : 500,
			error : err
		}
		res.json(o.status,o);
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
		if((1*data.loads) > 0){
			db.updatePage(req.params.page,data)
				.then(success,error)	
		} else {
			
			db.deletePage(req.params.page,data)
				.then(success,error)	
		}
	
		function success(reply){
			delete data.visitors;
			delete data.expires;
			var page = {
				'page' : {
					'data' : data,
					'title' : 'testTitle'
				}
			};
			res.render('page',page);
		}
	
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

// I can use q internal to this, but I'm not sure how useful that is.

function getFile(req,res){
	fs.stat(serverRoot+req.url,function(err,stats){
		if(err){
			res.render('404',404);
		} else {
			res.sendfile(serverRoot+req.url);
		}
	});
}
