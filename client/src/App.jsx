import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';
import './App.css'
import NavHeader from './components/NavbarComponents';
import NotFound from './components/NotFoundComponent';
import Planes from './components/PlanesComponents';
import Status from './components/StatusComponents';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import API from './API';
import { LoginForm } from './components/AuthComponents';

function App() {
  const [userReservations, setUserReservations] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState([])
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      fetchUserReservations();
    }else{
      setUserReservations([])
    }
  }, [loggedIn, update]);

  const fetchUserReservations = async () => {
    try {
      const reservations = await API.getReservationsByUserId(user.id); 
      setUserReservations(reservations);
      setUpdate(false)

    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo(); // we have the user info here 
      if(user){
      setUser({
        id: user.id,
        username: user.username,
      })
    
      setLoggedIn(true);
    };
  }
    checkAuth();
  }, [loggedIn]);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.username}!`, type: 'success'});
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMessage('');
  };


  const handleDeleteReservation = async (reservation) => {
    try {
      await API.deleteReservation(reservation);
      setMessage({ msg: `Reservation #${reservation.id} has been deleted successfully!` });
      setUpdate(true);

    } catch (error) {
      setMessage({ msg: error, type: 'danger' });
    }
  };

  
  const handleCreateReservation = async () => {
    try {
      //setMessage({ msg: `Reservation #${reservation.id} has been created successfully!` });
      setUpdate(true);

    } catch (error) {
      setMessage({ msg: error, type: 'danger' });
    }
  };

  



  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <>
              <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} />
              <Container fluid className="mt-3">
                {message && (
                  <Row>
                    <Alert variant={message.type} onClose={() => setMessage('')} dismissible>
                      {message.msg}
                    </Alert>
                  </Row>
                )}
                <Outlet />
              </Container>
            </>
          }
        >
          <Route index element={<Planes loggedIn={loggedIn} userReservations={userReservations} onDelete={handleDeleteReservation} />} />
          <Route path ="/planes/:type" element={<Status loggedIn={loggedIn} userReservations={userReservations} userId={user.id} onBook={handleCreateReservation} />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
  }
  
  export default App;