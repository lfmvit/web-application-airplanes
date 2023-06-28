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
exports.createReservation = (userId, planeType, status) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO reservations (user_id, plane_type, status) VALUES (?, ?, ?)`;
      db.run(query, [userId, planeType, status], function (error) {
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
      const placeholders = seatsToUpdate.map(() => '(?, ?)').join(', ');
      const values = seatsToUpdate.flatMap((seat) => [seat.status, seat.id]);
  
      const query = `
        UPDATE seats 
        SET status = CASE id
          ${seatsToUpdate.map((seat) => `WHEN ${seat.id} THEN ?`).join(' ')}
          ELSE status
        END
        WHERE id IN (${placeholders})
      `;
  
      db.run(query, values, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };