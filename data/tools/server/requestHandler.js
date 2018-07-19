var querystring = require('querystring'),
    fs = require('fs'),
    formidable = require('formidable');
var http = require('http');
var path = require('path');
var child_process = require('child_process');
var crypto = require('crypto');
var url = require('url');
var util = require('util');
//var sleep = require('sleep');
var HashTable = require('./HashTable').HashTable;
var co = require('co');
var suspend = require('suspend');
var fs = require("fs")
var map = new HashTable();


function start (response, request) {
    console.log('start module');

  var body = '<html>'+
      '<head>'+
      '<meta http-equiv="Content-Type" '+
      'content="text/html; charset=UTF-8" />'+
      '</head>'+
      '<body>'+
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="file" name="upload" multiple="multiple">'+
      '<input type="submit" value="Submit text" />'+
      '</form>'+
      '</body>'+
      '</html>';

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(body);
    response.end();
}
function curitem(response,request){
    console.log('curitem module');

    // var arg = url.parse(request.url).query;
    // var filename = querystring.parse(arg).srcid;

    // var filePath = './result/' + filename;
    var filePath_data = fs.readFileSync('./data/log/cur_project_path.txt');
    var filePath = filePath_data.toString();
    console.log(filePath);
    fs.readFile(filePath, function(error, content){
        if (error){
                var json = JSON.stringify({
                msg: 'No release bundle found.',
                code: '300',
            });
            response.writeHead(300, {'Content-Type': 'application/json'});
            response.end(json);
        }
        else{
            response.writeHead(200, {'Content-Type': 'application/octet-stream'});
            response.end(content, 'utf-8');
        }
    });
}
exports.curitem = curitem;
exports.start = start;
exports.port = this.port;
