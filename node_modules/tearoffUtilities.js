// place to put things you might need multiple spots, or general functions you don't
// want bloating app.js and that would need to be used in extensions, like data sources.

var Q		= require('q');
var crypt 	= require('crypto');

// generate Random string of length


exports.createURL = function(len){
	var deferred = Q.defer();
	crypt.randomBytes(len, function(err, buf) {
		if(err) deferred.reject(err);
		var token = buf.toString('hex');
		deferred.resolve(token)
	});	
	return deferred.promise
}
