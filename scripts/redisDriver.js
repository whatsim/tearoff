var Q 		= require('q');
var redis	= require('redis'), client = redis.createClient();
var util	= require('./tearoffUtilities.js');

// can serve as template for other data sources.
// must expose a loadPage, savePage, and updatePage method and return a Q promise 

exports.loadPage = function(url){
	var deferred = Q.defer();
	client.get(url,function (err, reply){
		if(err || reply == null) deferred.reject(err ? err : "no such bulletin");
		deferred.resolve(JSON.parse(reply));
		// deferred.resolve(reply);
	});
	return deferred.promise
}

exports.updatePage = function(url,data){
	var deferred = Q.defer();
	client.set(url,JSON.stringify(data),function (err, reply){
		if(err) deferred.reject('update failed');
		deferred.resolve(reply);
	});
	return deferred.promise
}

exports.deletePage = function(url,data){
	var deferred = Q.defer();
	
	client.del(url,function (err, reply){
		
		if(err) deferred.reject(err);
		deferred.resolve(reply);
	});
	return deferred.promise
}

exports.savePage = function(data){
	var deferred = Q.defer();
	
	doSave(util.createReadableURL())

	function doSave(url){
		client.set(url, JSON.stringify(data), function (err, reply){
			if(err) deferred.reject('failed to save');
			deferred.resolve(url);
		});
	}
	return deferred.promise
}

