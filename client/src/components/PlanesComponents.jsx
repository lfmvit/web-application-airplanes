import { useState } from 'react';
import { Container, Row, Col, Image, Modal, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import localImage from '../assets/local.png';
import nationalImage from '../assets/national.png';
import internationalImage from '../assets/international.png';

const Planes = ({ loggedIn, userReservations, onDelete }) => {



  const handleDeleteReservation = (reservationId) => {
    onDelete(reservationId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container className="text-center">
      <h1 className="mt-4 bg-primary text-white text-center">Welcome to Faloppa's Wing!</h1>

      {loggedIn && userReservations.length > 0 && (
        <>
          {/* Reservations */}
          <h2 className="bg-primary text-white text-center mt-4">Currently, you have {userReservations.length} reservations:</h2>
          <Container className="mt-4 mb-4">
            <Row className="justify-content-center">
              {userReservations.map((reservation) => (
                <Col xs={12} sm={4} key={reservation.id}>
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        Reservation #{reservation.id} for {reservation.planeType}
                      </Card.Title>
                      <Card.Text>
                        Seats: {reservation.seats.map((seat) => seat.seat).join(', ')}
                      </Card.Text>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteReservation(reservation)}
                      >
                        Delete Reservation
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </>
      )}

<div>
  <h3 className="bg-primary text-white text-center mt-4">Click on a plane to check for availability:</h3>
  <Row className="justify-content-center mt-4">
    <Col xs={12} sm={4} className="text-center">
      
        <Link to={`/planes/local`}>
          <div className="plane-container">
            <Image src={localImage} alt="Local Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">Local Plane</h3>
          </div>
        </Link>
      
    </Col>
    <Col xs={12} sm={4} className="text-center">
      
        <Link to={`/planes/regional`}>
          <div className="plane-container">
            <Image src={nationalImage} alt="Regional Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">Regional Plane</h3>
          </div>
        </Link>
     
    </Col>
    <Col xs={12} sm={4} className="text-center">
        <Link to={`/planes/international`}>
          <div className="plane-container">
            <Image src={internationalImage} alt="International Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">International Plane</h3>
          </div>
        </Link>
    </Col>
  </Row>
</div>

    
    </Container>
  );
};

export default Planes;
