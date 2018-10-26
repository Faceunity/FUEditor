var request = require('request');
var path=require('path');
var fs=require('fs');

var versionpath = process.argv[2];

var options = {
  url: 'https://api.github.com/repos/faceunity/fueditor/releases/latest',
  headers: {
    'User-Agent': 'Chrome/62.0.3202.94'
  }
};

function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		var info = JSON.parse(body);
		console.log(info.tag_name);
		console.log(info.body);
		console.log("download url:\n"+ info.assets==undefined ? "" : info.assets[0].browser_download_url)
		fs.writeFileSync(versionpath,body);
	}else{
		console.log("get version failed");
		console.log("response.statusCode==",response.statusCode);
		console.log("body:\n",body);
	}
}

request(options, callback);
