// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var lwip = require('lwip');
var exphbs = require('express-handlebars');
var formidable = require('formidable');
var fs = require('fs');
var sharp = require('sharp');
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
    res.render('index', {});
});

app.get('/images', function (req,res) {
  fs.readdir(path.join(__dirname, 'public', 'resized-images'), (err, files) => {
    var files_array = Array();
    files.forEach(file => {
        files_array.push(file);
    });
    res.render('images',{"img":files_array});
  });
});

app.post('/upload', function(req, res) {
   var form = new formidable.IncomingForm();

  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/uploads');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    lwip.open(path.join(form.uploadDir, file.name), function(err, image){
        image.cover(320,320, function(err, image){
            image.writeFile(path.join(__dirname, 'public', 'resized-images', file.name), function(err){
                if (err != null)
                    console.log(err);
            });
        });
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

app.listen(8000, function () {
  console.log('Example app listening on port 3000!')
})
