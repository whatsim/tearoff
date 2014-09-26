// requires

var fs		= require('fs');
var express	= require('express'), app = express();
var jade	= require('jade');
var Q 		= require('q');
var db		= require('./scripts/redisDriver.js');
var sha1	= require('sha1');
var util	= require('./scripts/tearoffUtilities.js');

// express conf

var serverRoot = require('path').dirname(require.main.filename);

app.use(express.bodyParser());
app.set('views', serverRoot + '/views');
app.set('view engine', 'jade');

// main routes

app.get('/',getHome);
app.get('/about',getAbout);
app.get('/:page',getPage);

// rest routes should go here

app.get('/peek/:page',getPeek);
app.post('/postPage',postPage);

// asset routes

app.get('/assets/:type/:name',getFile);

app.listen(8080);

// handle routes

function getHome(req,res){
	var page = {
		'page' : {
			'title' : 'Tearoff - Home'
		}
	};
	res.render('home',page);
}

function getAbout(req,res){
	var page = {
		'page' : {
			'title' : 'Tearoff - About'
		}
	};
	res.render('about',page)
}

function postPage(req,res){
	
	// pageText
	// loads
	// strict
	
	var time = new Date()
	var ipHash = sha1(req.ip);
	var saveO = {
		pageText : util.marked(req.body.pageText),
		loads : req.body.loads,
		strict : req.body.strict,
		expires : time.setUTCDate(req.body.days+time.getUTCDate()),
		visitors : [ipHash]
	};

	db.savePage(saveO).then(success, error);
		
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
			
			if(data.visitors.indexOf(ipHash) < 0){
				data.visitors.push(ipHash);
				data.loads --;
			}
		}

		var expired = 1*data.expires < Date.now();

		if((1*data.loads) > 0 && !expired){
			db.updatePage(req.params.page,data)
				.then(success,error)	
		} else {
			var cb = success;
			if(expired) cb = error
			// don't show the post if its expired

			db.deletePage(req.params.page,data)
				.then(cb,error)	
		}
	
		function success(reply){
			delete data.visitors;
			delete data.expires;
			var page = {
				'page' : {
					'data' : data,
					'title' : 'Tearoff'
				}
			};
			res.render('page',page);
		}
	
	}
	
	function error(err){
		var page = {
			'page' : {
				'data' : err,
				'title' : 'Tearoff - Not Found'
			}
		};
		res.render('404', page);
	}
}

function getPeek(req,res){
	db.loadPage(req.params.page)
		.then(success, error);
	
	function success(data){
		delete data.visitors;
		delete data.expires;
		delete data.pageText;
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
