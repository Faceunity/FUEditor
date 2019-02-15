
/*
var server = require('./server');
var router = require('./router');
var requestHandler = require('./requestHandler');
var formidable = require('formidable'); // require路径搜索算法？？

var handler = {};
handler['/'] = requestHandler.start;
handler['/curitem'] = requestHandler.curitem;
// handler[process.argv[3]] = requestHandler.curitem;
handler['port'] = process.argv[3];
handler['type'] = process.argv[2];

server.start(router.route, handler);
*/

console.log(process.argv);

var port = process.argv[3];
var bundle_type = process.argv[2];

var express = require('express');
var http = require('http');
var fs = require("fs")
var node_zip = require('node-zip');
var app = express();

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
app.get('/curitem', function(request, response){
    var filePath_data = fs.readFileSync('./data/log/cur_project_path.txt');
    var filePath = filePath_data.toString();
    console.log(filePath);

    if (request.query.appid === undefined) {
        response.redirect('http://www.faceunity.com/FUSync-guide.html');
    }
    else if(request.query.appid === 'fusync')
    {
        if(!fs.existsSync(filePath)) {
            var json = JSON.stringify({
                msg: 'No release bundle found.',
                code: '300',
            });
            response.writeHead(300, {'Content-Type': 'application/json'});
            response.end(json);
            return;
        }
        var stat = fs.statSync(filePath);
        console.log("stat.mtime",stat.mtime);

        var filename=filePath.substr(filePath.lastIndexOf('/')+1);
        filename= filename.substr(0,filename.lastIndexOf('.'));
        fs.readFile(filePath, function(error, content){
            if (error){
                var json = JSON.stringify({
                    msg: error.messgae,
                    code: '300',
                });
                response.writeHead(300, {'Content-Type': 'application/json'});
                response.end(json);
            }
            else{
              var type_json = JSON.stringify({
                      t: parseInt(bundle_type),
                      time: stat.mtime.Format("yyyyMMdd-hh:mm:ss"),
                      name: filename
                });


                //console.log("type",this.type);
                var zip = new node_zip();
                zip.file("info.json", type_json);
                zip.file("curitem.bundle", content);
                var data = zip.generate({base64:false,compression:'DEFLATE'});
                // fs.writeFileSync('test.zip', data, 'binary');

                response.writeHead(200, {'Content-Type': 'application/octet-stream'});
                response.end(new Buffer(data, 'binary'));

            }
        });

    }

});
//http://127.0.0.1:13157/p2a?t=6&appid=fusync
app.get('/p2a', function(request, response){
    var filePath_data = fs.readFileSync('./data/log/cur_project_path.txt');
    var filePath = filePath_data.toString();
    console.log(filePath);
    console.log(request.query.t);
    if(request.query.t == 6)
        filePath=filePath.substr(0,filePath.lastIndexOf('/Projects')+1)+"A2P/controller.bundle";   
    else if(request.query.t == 8)
        filePath=filePath.substr(0,filePath.lastIndexOf('/Projects')+1)+"A2P/male_body.bundle";       
    else if(request.query.t == 9)
        filePath=filePath.substr(0,filePath.lastIndexOf('/Projects')+1)+"A2P/female_body.bundle";  
    else if(request.query.t == 10)
        filePath=filePath.substr(0,filePath.lastIndexOf('/Projects')+1)+"A2P/male_head.bundle"; 
    else if(request.query.t == 11)
        filePath=filePath.substr(0,filePath.lastIndexOf('/Projects')+1)+"A2P/female_head.bundle"; 
    else{
        var json = JSON.stringify({
            msg: 'No bundle found.',
            code: '300',
        });
        response.writeHead(300, {'Content-Type': 'application/json'});
        response.end(json);
        return;
    }

    console.log("A2Pfilename",filePath);
    if (request.query.appid === undefined) {
        response.redirect('http://www.faceunity.com/FUSync-guide.html');
    }
    else if(request.query.appid === 'fusync')
    {
        if(!fs.existsSync(filePath)) {
            var json = JSON.stringify({
                msg: 'No body bundle found.',
                code: '300',
            });
            response.writeHead(300, {'Content-Type': 'application/json'});
            response.end(json);
            return;
        }
        var stat = fs.statSync(filePath);
        console.log("stat.mtime",stat.mtime);

        fs.readFile(filePath, function(error, content){
            if (error){
                var json = JSON.stringify({
                    msg: error.messgae,
                    code: '300',
                });
                response.writeHead(300, {'Content-Type': 'application/json'});
                response.end(json);
            }
            else{
              var type_json = JSON.stringify({
                      t: parseInt(8),
                      time: stat.mtime.Format("yyyyMMdd-hh:mm:ss"),
                      name: "p2a"
                });
                var zip = new node_zip();
                zip.file("info.json", type_json);
                zip.file("curitem.bundle", content);
                var data = zip.generate({base64:false,compression:'DEFLATE'});
                response.writeHead(200, {'Content-Type': 'application/octet-stream'});
                response.end(new Buffer(data, 'binary'));

            }
        });

    }

});
var server = http.createServer(app);

server.listen(parseInt(port));
