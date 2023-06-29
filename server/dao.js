const crypto = require('crypto');

const db = require('./db');



/**
 * Query the database and check whether the username exists and the password
 * hashes to the correct value.
 * If so, return an object with full user information.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise} a Promise that resolves to the full information about the current user, if the password matches
 * @throws the Promise rejects if any errors are encountered
 */

// USER SECTION
// FOR LOGIN

exports.getUser= (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (!row) {
          reject('Invalid username or password');
        } else {
          const salt = row.salt;
          const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');

          if (hashedPassword === row.password) {
            console.log(row)
            resolve(row);
          } else {
            reject('Invalid username or password');
          }
        }
      }
    });
  });
}

// FOR SINGLE FETCH

exports.getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE username = ?`;
      db.get(query, [username], (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(row);
        }
      });
    });
}

// FOR SINGLE FETCH

exports.getUsers = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT username FROM users';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  

  // RESERVATION AND SEATS SECTION

  
// Reservation DAO methods
exports.createReservation = (userId, planeType, seats) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO reservations (user_id, plane_type, seats) VALUES (?, ?, ?)`;
      db.run(query, [userId, planeType, seats], function (error) {
        if (error) {
          reject(error);
        } else {
          resolve(this.lastID);
        }
      });
    });
  };
  
  exports.getReservationsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM reservations WHERE user_id = ?`;
      db.all(query, [userId], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  };
  
  exports.deleteReservationById = (reservationId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM reservations WHERE id = ?`;
      db.run(query, [reservationId], function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  // Seat DAO methods

  /*
  For simplicity, an airplane is composed of a set of seats arranged in a grid format with F rows and P seats per row. 
  The number of rows and seats per row depends on the type of plane being booked.
   There are three types of planes: local (F = 15, P = 4), regional (F = 20, P = 5), and international (F = 25, P = 6).
  */

  
  
  // Seat DAO method
  exports.getSeatStatusByPlaneType = (planeType) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, row, position, status FROM seats WHERE plane_type = ?`;
      db.all(query, [planeType], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  };
  
  exports.updateSeatStatuses = (seatsToUpdate) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE seats
        SET status = ?
        WHERE id = ?
      `;
  
      seatsToUpdate.forEach((seat) => {
        db.run(query, [seat.status, seat.id], function (error) {
          if (error) {
            reject(error);
            return;
          }
        });
      });
  
      resolve();
    });
  };

  exports.checkSeatsAvailability = async (seatIds) => {
    try {
      console.log('in dao: ' + seatIds);
  
      // Generate the placeholders for the SQL query
      const placeholders = seatIds.map(() => '?').join(', ');
  
      // Query the database to check seat availability
      const seats = await new Promise((resolve, reject) => {
        const query = `SELECT id, status FROM seats WHERE id IN (${placeholders})`;
        db.all(query, seatIds, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      });
  
      const occupiedSeats = [];
  
      // Iterate through the seats and collect the occupied seat IDs
      for (const seat of seats) {
        if (seat.status === 'occupied') {
          occupiedSeats.push(seat.id);
        }
      }
  
      return {
        occupiedSeats,
      };
    } catch (error) {
      throw error;
    }
  };
  