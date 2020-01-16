const express = require('express');
const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
const fileUploader = require('express-fileupload');
const lengthUrl = 5;
// var url = '';

function randomStr(length){
    let randomNum = Math.random();
    let base36string = randomNum.toString(36);
    return base36string.substring(2, 2+length);
}

// TODO: Get list of files from given url
// Then extend it as a POST route to fetch files real time
// function getFiles(url){
//
// }

var app = express();
app.use(fileUploader());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'nunjucks');
// app.set('views', path.join(__dirname, 'views'));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

var port = 3000;

fs.mkdir(path.join(__dirname,'uploads'), function (err) {
    if (err){
        console.log(err);
    }
});

app.get('/', function (req,res) {
    let url = randomStr(lengthUrl);
    res.redirect(`/files/${url}`);
});

var regex = /^\/files\/\S+$/;  // /^\S+$/;
app.get(regex, function (req,res) {
    let local_url = req.url;
    console.log('Raw URL: '+local_url);
    local_url = local_url.split('/');
    console.log('URL after being split: '+local_url);
    let url = local_url[local_url.indexOf('files')+1];
    console.log('URL is: '+url);
    let files = [];
    fs.readdir(path.join(__dirname,'uploads',url), function (err, fileArray) {
        files = fileArray;
        if(files !== undefined){
            for(let i=0; i<files.length; i++){
                let file = files[i];
                let stat = fs.statSync(path.join(__dirname,'uploads',url,file));
                files[i] = {
                    name: file,
                    size: stat.size,
                    ctime: new Date(stat.ctime).toString().
                            split(' ').slice(0,5).join(' ')
                };
                if(files[i].size > 1024*1024){ //1 MB
                    files[i].size = `${(files[i].size/(1024*1024)).toFixed(2)} MB`;
                }
                else if(files[i].size > 1024){ //1 KB
                    files[i].size = `${(files[i].size/1024).toFixed(2)} KB`;
                }
                else{ // size is in bytes
                    files[i].size = `${(files[i].size)} B`;
                }
                console.log('Time is', files[i].ctime);
            }
            console.log('Files found are:\n'+files.map((file) => file.name));
        }
        else{
            console.log('No files found here!');
        }
        res.render('index.html',{
            files: files,
            url: url
        });
    });

});

app.post('/upload', function (req, res) {
    if(!req.files){
        return res.status(400).send("No file uploaded");
    }
    let url = req.headers.referer.split('/files/')[1];
    console.log('req is',req.headers.referer);
    console.log('In upload route, url is: '+url);
    console.log('Files are',req.files);
    let files = req.files.uploaded_file;
    if(Array.isArray(files)){
        for(let i=0; i<files.length; i++){
            let file = files[i];
            fs.mkdir(path.join(__dirname,'uploads',url), function (err) {
                if (err){
                    console.log(err);
                }
            });
            let file_location = path.join(__dirname,'uploads',url,file.name);
            file.mv(file_location);
        }
    }
    else{
        let file = req.files.file;
        fs.mkdir(path.join(__dirname,'uploads',url), function (err) {
            if (err){
                console.log(err);
            }
        });
        let file_location = path.join(__dirname,'uploads',url,file.name);
        file.mv(file_location);
    }
    res.redirect(`/files/${url}`);
})

// app.listen(port, function (req,res) {
//     console.log(`Listening on port no ${port}`);
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
