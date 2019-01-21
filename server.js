var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mogis');

const flash = require('express-flash');
app.use(flash());

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var MongisSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    age: { type: Number, required: true, min: 1 },
    pack: { type: String, required: true, minlength: 2, maxlength: 65 }
}, { timestamps: true });

mongoose.model('Mongoose', MongisSchema);
var Mongoose = mongoose.model('Mongoose')


app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    Mongoose.find({}).sort({ createdAt: -1 }).exec(function (err, mongoose) {
        if (err) {
            console.log('Something Went Wrong-display');
        } else {
            console.log("It worked");
            res.render('index.ejs', { mongoose: mongoose });
        }
    });
});

app.post('/mongooses', function (req, res) {
    console.log("POST DATA", req.body);
    var mong_instance = new Mongoose(req.body);
    mong_instance.save(function (err) {
        if (err) {
            console.log('something went wrong', err);
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/add');
        } else {
            console.log('successfully added a Mongoose!');
            res.redirect('/');
        }
    });
});
app.get('/add', function (req, res) {
    res.render('add.ejs')
});
app.get('/mongooses/:id', function (req, res) {
    Mongoose.findOne({ _id: req.params.id }, function (err, mongoose) {

        if (err) {
            console.log('Error Occured');
            res.redirect('/');
        } else {
            console.log('New mongoose info');
        }
        console.log(mongoose)
        res.render('onemon.ejs', { mongoose: mongoose });
    }
    )
});
app.get('/mongooses/edit/:id', function (req, res) {
    Mongoose.findOne({ _id: req.params.id }, function (err, mongoose) {
        if (err) {
            console.log('Error Occured');
            res.redirect('/');
        } else {
            console.log('New mongoose info');
            res.render('edit.ejs', { mongoose: mongoose });
        }
    }
    );
});
app.post('/update/:id', function (req, res) {
    Mongoose.update(
        { _id: req.params.id },
        { name: req.body.name, age: req.body.age, pack: req.body.pack },
        function (err, mongoose) {
            if (err) {
                console.log('Error Occured');
                res.redirect('/');
            } else {
                console.log('update worked');
            }
        });
    res.redirect('/mongooses/' + req.params.id);
});
app.get('/delete/:id', function (req, res) {
    Mongoose.remove(
        { _id: req.params.id },
        function (err, mongoose) {
            if (err) {
                console.log('Error Occured');
                res.redirect('/');
            } else {
                console.log('Delete Worked');
                res.redirect('/')
            }
        });
});
app.listen(8000, function () {
    console.log("listening on 8000");
});