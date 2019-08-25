const express = require('express');
const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
const fileUploader = require('express-fileupload');
const lengthUrl = 5;
var url = '';

function randomStr(length){
    let randomNum = Math.random();
    let base36string = randomNum.toString(36);
    return base36string.substring(2, 2+length);
}

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

app.get('/', function (req,res) {
    url = randomStr(lengthUrl);
    res.redirect(`/files/${url}`);
    // res.redirect(`${url}`)
});

var regex = /^\/files\/\S+$/;   // /^\S+$/;
app.get(regex, function (req,res) {
    // let url = req.url;
    // console.log(url);
    // url = url.split('/');
    // console.log(url);
    // url = url[2];
    console.log('url is: '+url);
    let files = [];
    fs.readdir(path.join(__dirname,'uploads',url), function (err, fileArray) {
        files = fileArray;
        console.log('Files found are:\n'+files);
        res.render('index.html',{
            files: files,
            url: url
        });
    });

});

app.post('/upload', function (req, res) {
    // let url = req.headers.referer;
    // console.log('initial url is '+url);
    // url = url.split('/')
    // url = url[2];
    console.log('inside upload, url is: '+url);
    let file = req.files.uploaded_file;
    fs.mkdir(path.join(__dirname,'uploads',url), function (err) {
        if (err){
            console.log(err);
        }
    });
    let file_location = path.join(__dirname,'uploads',url,file.name);
    file.mv(file_location);
    file_location = path.join('uploads',url,file.name);
    res.redirect(`/files/${url}`);
})

app.listen(port, function (req,res) {
    console.log(`Listening on port no ${port}`);
});
