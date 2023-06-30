'use strict';

const express = require('express');

// init express
const app = new express();
const port = 3001;

const morgan = require('morgan');
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
  try{
  const userDAO = await dao.getUser(username, password);
  const user = {id: userDAO.id, username: userDAO.username}
  console.log(user)
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
  }catch{
    return cb(null, false, 'Incorrect username or password.');
  }
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


// loggedin middleware


const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}



// core routes--


app.get('/api/planes/:type/status', async (req, res) => {
  const type = req.params.type;
  try {
    const reservations = await dao.getSeatStatusByPlaneType(type);
    if(!reservations) {
    return res.status(404).json({error: 'No seats or planetype found in the database'});
    }
    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(500).end();
  }
});

// POST /api/planes/:type/reservation 
// set up a new reservation

app.post('/api/user/reservations', isLoggedIn, async (req, res) => {
  try {
    const { reservation } = req.body;

    const userId = reservation.userId;
    const planeType = reservation.type;
    const seats = reservation.seats;

    const formattedSeats = seats.map(seat => ({
      seat: seat.seat,
      id: seat.id
    }));

    // integrity check on type first of all
    const existingReservation = await dao.getReservationByUserAndPlaneType(userId, planeType);

      if (existingReservation) {
  // User already has a reservation for the same plane type, return an error
      return res.status(400).json({ error: 'User already has a reservation for this plane type' });
    }

    // map the seat IDs associated with the reservation
    const seatIds = seats.map(seat => seat.id);

    // Check seat availability before creating the reservation
    const { occupiedSeats } = await dao.checkSeatsAvailability(seatIds);

    if (occupiedSeats.length > 0) {
      // Some seats are already occupied, return the occupied seats to the application
      return res.status(400).json({ error: 'Some Seats already have been occupied', occupiedSeats });
    }

    const seatsToUpdate = seatIds.map(seatId => ({ id: seatId, status: 'occupied' }));
      // Storing json format string
    const seatsString = JSON.stringify(formattedSeats);

    await Promise.all([
      dao.createReservation(userId, planeType, seatsString),
      dao.updateSeatStatuses(seatsToUpdate)
    ]);

    // Return a success response
    res.sendStatus(204);
  } catch (error) {
    console.log('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});


// get reservations by id user

app.get('/api/user/reservations', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userReservation = await dao.getReservationsByUserId(userId);
    
    res.status(200).json(userReservation);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});


// DELETE /api/planes/:type
app.delete('/api/user/reservations', isLoggedIn, async (req, res) => {
  try {
    const { reservation } = req.body;
    if(!reservation){
      return res.status(400).json({error: 'body request is missing'})
    }

    const reservationId = reservation.id;

    // Get the seat IDs associated with the reservation
    const seatIds = reservation.seats.map(seat => seat.id);
    
    // Prepare the seat objects to update status
    const seatsToUpdate = seatIds.map(seatId => ({ id: seatId, status: 'available' }));


    // Delete the reservation and update the status of seats in the database
    await Promise.all([
      dao.deleteReservationById(reservationId),
      dao.updateSeatStatuses(seatsToUpdate)
    ]);

    res.sendStatus(204);
  } catch (error) {
    console.log('Error deleting reservation:', error);

    res.status(500).json({ error: 'Failed to delete reservation' });
  }
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
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(() => {
    res.send(204);
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
