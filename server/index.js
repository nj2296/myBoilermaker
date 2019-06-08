const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
// const SequelizeStore = require('connect-session-sequelize')(session.Store);
// const db = require('./db');
// const sessionStore = new SequelizeStore({ db });
const PORT = process.env.PORT || 3000;

const app = express();

// passport registration
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session middleware with passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Static file-serving middleware
app.use(express.static(path.join(__dirname, '../public')));

// sends index.html
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.listen(PORT, function() {
  console.log(`Server is listening on port ${PORT}!`);
});

module.exports = app;
