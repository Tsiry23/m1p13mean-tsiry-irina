var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
require('dotenv').config();

const mongoose = require('mongoose');
// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connecté"))
 .catch(err => console.log(err));

var indexRouter = require('./routes/index');
var utilisateurRouter = require('./routes/Utilisateur');
var roleRouter = require('./routes/Role');
var boutiqueRouter = require('./routes/Boutique');
var authRouter = require('./routes/auth');
var typePaiementRouter = require('./routes/TypePaiement');
var commandeRouter = require('./routes/Commande');
var produitRouter = require('./routes/Produit');
var paiementRouter = require('./routes/Paiement');
var venteRouter = require('./routes/Vente');
var favorisRouter = require('./routes/Favoris');
var emailRouter = require('./routes/Email');
var dashboardBoutiqueRouter = require('./routes/dashboardBoutique');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/utilisateur', utilisateurRouter);
app.use('/role', roleRouter);
app.use('/boutique', boutiqueRouter);
app.use('/type-paiement', typePaiementRouter);
app.use('/commande', commandeRouter);
app.use('/produit', produitRouter);
app.use('/paiement', paiementRouter);
app.use('/vente', venteRouter);
app.use('/auth', authRouter);
app.use('/favoris', favorisRouter);
app.use('/email', emailRouter);
app.use('/dashboard-boutique', dashboardBoutiqueRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
