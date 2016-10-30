var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var redis = require('redis');
//var redis_client = redis.createClient("6379","127.0.0.1");
var redis_client = redis.createClient();

redis_client.on('connect', function() {
	 console.log('Redis Connected');
});


shasum = crypto.createHash('sha1');
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json());

app.get('/index.html',function(request,response){

	response.sendFile(path.join(__dirname +'/public'+'/index.html'));

});

app.get('/*', function(request,response){
	var url = request.url;
	while(url.charAt(0) === '/'){
		url = url.substr(1);
	}
	console.log(url);
	redis_client.get(url, function(err,res){
		//do errror handling
		console.log(res);
		response.writeHead(301,{Location:res});
		response.end();
		
	});

});

app.post('/index.html', function(request, response){
	var url = request.body.id;
	//validate URL
	shasum = crypto.createHash('sha1');
	shasum.update(url);
	key = shasum.digest('hex');
	redis_client.set(key,url, function(err,reply){
		console.log(reply);
	});
	console.log(key);
	console.log(url);
	response.end('<html><body><h3>'+key+'</h3></body></html>');
	//response.sendFile(path.join(__dirname+'/public'+'/result.html'));
});


app.listen(3000);
