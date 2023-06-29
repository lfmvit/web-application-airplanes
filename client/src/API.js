import { Reservation, Seat } from './models';
const SERVER_URL = 'http://localhost:3001';


const getStatusByType = async (type) => {
  const response = await fetch(`${SERVER_URL}/api/planes/${type}/status`); // Fixed the URL to include '/status'
  if (response.ok) {
    const statusJson = await response.json();
    return statusJson.map(
      (s) =>
        new Seat(s.id, s.reservationId, s.row, s.position, s.status)
    );
  } else {
    throw new Error('Internal server error');
  }
};


const getReservationsByUserId = async (userId) => {
  try {
    const response = await fetch(SERVER_URL + `/api/user/reservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const reservationsData = await response.json();

      console.log(reservationsData);
      const reservations = reservationsData.map((reservation) => {
        const { id, user_id, plane_type, seats } = reservation;
        const parsedSeats = JSON.parse(seats); // Convert seats string to array
        const reservationObj = new Reservation(id, user_id, plane_type, parsedSeats);
        console.log(reservationObj)

        return reservationObj;
      });
      return reservations;
    } else {
      throw new Error('Failed to fetch reservations');
    }
  } catch (error) {
    throw error;
  }
};

const createReservation = async (reservation) => {
  try {
    const response = await fetch(SERVER_URL + '/api/user/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservation }),
    });

    if (!response.ok) {
      throw await response.json()
    }
  } catch (error) {
    throw error;
  }
};

const deleteReservation = async (reservation) => {
  try {
    const response = await fetch(SERVER_URL + '/api/user/reservations', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservation }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete reservation');
    }
  } catch (error) {
    throw error;
  }
};


const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const API = { deleteReservation, createReservation, getReservationsByUserId, getStatusByType, logIn, logOut, getUserInfo };
export default API;