// place to put things you might need multiple spots, or general functions you don't
// want bloating app.js and that would need to be used in extensions, like data sources.

var Q		= require('q');
var crypt 	= require('crypto');
var marked	= require('marked'); 
var adjNoun = require('adj-noun');

adjNoun.seed(Date.now());

// configure marked here so its not in app

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

exports.marked = marked;

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

exports.createReadableURL = function(){
	return adjNoun().join('-')
}
