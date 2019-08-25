const express = require('express');
const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
const fileUploader = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const lengthUrl = 5;

function randomStr(length){
    let randomNum = Math.random();
    let base36string = randomNum.toString(36);
    return base36string.substring(2, 2+length);
}

const db_url = 'mongodb://127.0.0.1:27017';
const db_name = 'mydb';

MongoClient.connect(db_url, function (err, db){
    if(err) {
        console.log(err);
        return;
    }
    console.log('Connected to MongoDB!');
    db.close();
});

var app = express();
app.use(fileUploader());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'nunjucks');
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

var port = 3000;

app.get('/', function (req,res) {
    let url = randomStr(lengthUrl);
    // res.redirect(`/files/${url}`);
    res.redirect(`/${url}`)
});

var regex = /^\S+$/;
app.get(regex, function (req,res) {
    let url = req.url;
    url = url.slice(url.length-lengthUrl,url.length);
    console.log('url is: '+url);
    let files = [];
    MongoClient.connect(db_url, function (err, db){
        if(err) {
            console.log(err);
            return;
        }
        db.db(db_name).collection(url).find()
        .toArray(function (err, fileArray) {
            if (err) {
                console.log(err);
            }
            console.log('Files are:');
            console.log(fileArray);
            res.render('index.html',{
                files: fileArray
            });
        });
        return;
    });
    // fs.readdir(path.join(__dirname,'uploads','url'), function (err, fileArray) {
    //     files = fileArray;
    // });
    // console.log('Files found are:\n'+files);
    // res.render('index.html',{
    //     files: files
    // });
});

app.post('/upload', function (req, res) {
    let url = req.headers.referer;
    url = url.slice(url.length-lengthUrl,url.length);
    console.log('inside upload, url is: '+url);
    let file = req.files.uploaded_file;
    console.log(Object.keys(file));
    console.log(file.data);
    fs.mkdir(path.join(__dirname,'uploads',url), function (err) {
        if (err){
            console.log(err);
        }
    });
    let file_location = path.join(__dirname,'uploads',url,file.name);
    file.mv(file_location);
    file_location = path.join('uploads',url,file.name);
    // res.redirect(`${url}`);
    MongoClient.connect(db_url, function (err, db){
        if(err) {
            console.log(err);
            return;
        }
        db.db(db_name).collection(url).insertOne({
            name: file.name,
            index: file_location
        });
        res.redirect(`${url}`);
        db.close();
        return;
    });
})

app.listen(port, function (req,res) {
    console.log(`Listening on port no ${port}`);
});
