'use strict';

const express = require('express');

// init express
const app = new express();
const port = 3001;

const morgan = require('morgan');
const {check, validationResult} = require('express-validator');


const cors = require('cors');
const dao = require('./dao');


// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// set up middlewares
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await dao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.authenticate('session'));
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


// loggedin middleware


const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}



// core routes


app.get('/api/planes/:type/status', async (req, res) => {
  const type = req.params.type;
  try {
    const reservations = await dao.getSeatStatusByPlaneType(type);
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).end();
  }
});

// POST /api/planes/:type/reservation //set up a new reservation
// need logged in 

app.post('/api/planes/:type/reservations', isLoggedIn, async (req, res) => {
  try {
    // Retrieve the seats to update from the request body
    const seatsToUpdate = req.body;
    
    // Perform the bulk update of seat statuses
    await dao.updateSeatStatuses(seatsToUpdate);
    
    // Respond with a success message
    res.status(200).json({ message: 'Seat statuses updated successfully' });
  } catch (error) {
    // Handle any errors that occur during the update process
    res.status(500).json({ error: 'Failed to update seat statuses' });
  }
});

// DELETE /api/planes/:type

app.delete('/api/questions/:id/answers', async (req, res) => {

});


// SESSION ROUTES

// POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});


// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);
  }
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});
