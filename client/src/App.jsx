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
  const [userReservation, setUserReservation] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  /* useEffect(()=> {
    // get all the questions from API
    const getQuestions = async () => {   //! i would like here to set the reservations state to show current reservations
      const questions = await API.getQuestions();
      setQuestions(questions);
    }
    getQuestions();
  }, []); */

  useEffect(() => {
    const checkAuth = async () => {
      await API.getUserInfo(); // we have the user info here 
      setLoggedIn(true);
    };
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


  return (
    <BrowserRouter>
      <Routes>
        {/* 
        - / (index) -> all the questions
        - /questions/:questionId -> the page with the :questionId question info and its answers
        - /questions/:questionId/addAnswer -> the form to add a new answer
        - /questions/:questionId/editAnswer/:answerId -> the form to update the :answerId answer
        - * -> not found
        */}
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
          <Route index element={<Planes loggedIn={loggedIn} userReservation={userReservation} />} />
          
          <Route path ="/planes/:type" element={<Status loggedIn={loggedIn} userReservation={userReservation} />} />
          
          
          
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />}
          
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
  }
  
  export default App;