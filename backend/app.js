var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
require('dotenv').config();

const mongoose = require('mongoose');

var app = express();

/* =========================
   ENV VARIABLES
========================= */
const FRONT_URL = process.env.URL_HOST_FRONT;
const MONGO_URI = process.env.MONGO_URI;

/* =========================
   MONGODB CONNECTION
========================= */
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => {
    console.error("❌ Erreur MongoDB :", err);
    process.exit(1);
  });

/* =========================
   CORS CONFIG
========================= */
app.use(cors({
  origin: FRONT_URL,
  credentials: true
}));

/* =========================
   VIEW ENGINE
========================= */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/* =========================
   MIDDLEWARES
========================= */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   ROUTES
========================= */
app.use('/', require('./routes/index'));
app.use('/utilisateur', require('./routes/Utilisateur'));
app.use('/role', require('./routes/Role'));
app.use('/boutique', require('./routes/Boutique'));
app.use('/type-paiement', require('./routes/TypePaiement'));
app.use('/commande', require('./routes/Commande'));
app.use('/produit', require('./routes/Produit'));
app.use('/paiement', require('./routes/Paiement'));
app.use('/vente', require('./routes/Vente'));
app.use('/auth', require('./routes/auth'));
app.use('/favoris', require('./routes/Favoris'));
app.use('/email', require('./routes/Email'));
app.use('/dashboard-boutique', require('./routes/dashboardBoutique'));
app.use('/dashboard', require('./routes/Dashboard'));
app.use('/histo-loyer', require('./routes/HistoLoyer'));

/* =========================
   ERROR HANDLING
========================= */
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

/* =========================
   SERVER START
========================= */
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Serveur lancé sur ${process.env.URL_HOST_BACK}`);
// });

module.exports = app;