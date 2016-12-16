// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var Jimp = require("jimp");
var exphbs = require('express-handlebars');
var formidable = require('formidable');
var fs = require('fs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('index', {"home_nav":true});
});

app.get('/images', function (req,res) {
  fs.readdir(path.join(__dirname, 'public', 'resized-images'), (err, files) => {
    var files_array = Array();
    if (files!==undefined)
    files.forEach(file => {
        if(file!=".gitignore")
            files_array.push(file);
    });
    res.render('images',{"img":files_array, "images_nav":true});
  });
});

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/uploads');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name), function(err) {
        if (err != null) {
            console.log(err);
        }
        else {
            Jimp.read(path.join(form.uploadDir, file.name), function (err, image) {
                if (err) throw err;
                image.cover(320, 320)            // resize
                    .quality(60)                 // set JPEG quality
                    .write(path.join(__dirname, 'public', 'resized-images', file.name)); // save
            });
        }
            
    });
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function() {
    res.end('success');
  });

  form.parse(req);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(process.env.port || 3000, function () {
  console.log('Example app listening on port 3000!')
});
