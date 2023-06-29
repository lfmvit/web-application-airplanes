import { useState } from 'react';
import { Container, Row, Col, Image, Modal, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import localImage from '../assets/local.png';
import nationalImage from '../assets/national.png';
import internationalImage from '../assets/international.png';

const Planes = ({ loggedIn, userReservations, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaneType, setSelectedPlaneType] = useState('');

  const navigate = useNavigate();

  const handlePlaneClick = (planeType) => {
    if (!loggedIn) {
      setSelectedPlaneType(planeType);
      setShowModal(true);
    } else {
      const existingReservation = userReservations.find(
        (reservation) => reservation.planeType === planeType
      );

      if (existingReservation) {
        setSelectedPlaneType(planeType);
        setShowModal(true);
      } else {
        // Redirect logged-in user without reservation to the plane page
        navigate(`planes/${planeType}`);
      }
    }
  };

  const handleDeleteReservation = (reservationId) => {
    onDelete(reservationId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container className="text-center">
      <h1 className="mt-4 bg-primary text-white text-center">Welcome to Faloppa Airlines!</h1>

      {loggedIn && userReservations.length > 0 && (
        <>
          {/* Reservations */}
          <h2 className="mt-4">Currently, you have {userReservations.length} reservations:</h2>
          <Container className="mt-4">
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
  <h className="bg-primary text-white text-center mt-4">Click on a plane to check for availability:</h>
  <Row className="justify-content-center mt-4">
    <Col xs={12} sm={4} className="text-center">
      {!loggedIn ? (
        <Link to={`/planes/local`}>
          <div className="plane-container">
            <Image src={localImage} alt="Local Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">Local Plane</h3>
          </div>
        </Link>
      ) : (
        <div onClick={() => handlePlaneClick('local')} className="plane-container">
          <Image src={localImage} alt="Local Plane" fluid className="mb-3" />
          <h3 className="mt-4 bg-primary text-white text-center">Local Plane</h3>
        </div>
      )}
    </Col>
    <Col xs={12} sm={4} className="text-center">
      {!loggedIn ? (
        <Link to={`/planes/regional`}>
          <div className="plane-container">
            <Image src={nationalImage} alt="Regional Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">Regional Plane</h3>
          </div>
        </Link>
      ) : (
        <div onClick={() => handlePlaneClick('regional')} className="plane-container">
          <Image src={nationalImage} alt="Regional Plane" fluid className="mb-3" />
          <h3 className="mt-4 bg-primary text-white text-center">Regional Plane</h3>
        </div>
      )}
    </Col>
    <Col xs={12} sm={4} className="text-center">
      {!loggedIn ? (
        <Link to={`/planes/international`}>
          <div className="plane-container">
            <Image src={internationalImage} alt="International Plane" fluid className="mb-3" />
            <h3 className="mt-4 bg-primary text-white text-center">International Plane</h3>
          </div>
        </Link>
      ) : (
        <div onClick={() => handlePlaneClick('international')} className="plane-container">
          <Image src={internationalImage} alt="International Plane" fluid className="mb-3" />
          <h3 className="mt-4 bg-primary text-white text-center">International Plane</h3>
        </div>
      )}
    </Col>
  </Row>
</div>

      {/* Reservation Exist Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reservation Exist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You already have a reservation for {selectedPlaneType} plane.</p>
          <p>Please delete your previous reservation from this page.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Planes;
