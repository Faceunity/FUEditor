var request = require('request');
var path=require('path');
var needle = require('needle');
var fs=require('fs');

var baseUrl = "https://in-house.faceunity.com:8334/";
var api_upload = baseUrl + "file-upload";

var g_pfx = fs.readFileSync(path.resolve(__dirname,'../license/license.p12'));
console.log("p12",g_pfx);
var g_zip_buf = fs.readFileSync(process.argv[2]);
var g_target = process.argv[3];

var SendRequest = function(){return new Promise((resolve,reject)=>{
	var my_options = {
		url:api_upload,
		method:'POST',
		pfx:g_pfx,
		rejectUnauthorized:false,
		encoding:null,
		formData:{
			package:{
				value:g_zip_buf,
				options:{
					filename:"package.zip",
					contentType:'application/x-zip-compressed'
				}
			}
		},
	};
	var req = request.post(my_options,function(error,res,body){
		if(res)console.log("respone",res.statusCode)
		if(!error && res.statusCode === 200){
			resolve(body);
		}else{
			reject(error || new Error(body));
		}
	});
})};

var saveFile = function(data){
	console.log("saveFile");
	console.log("target path:",process.argv[3]);
	fs.writeFileSync(process.argv[3],data);
}

var handleReject = function(err){
	console.log("handleReject");
	console.log(err);
}

SendRequest().then(saveFile,handleReject)

