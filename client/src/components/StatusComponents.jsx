import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, Alert, Modal } from 'react-bootstrap';
import API from '../API.js';
import '../App.css';

const Status = ({ loggedIn, onBook, userId, userReservations }) => {
  const { type } = useParams();
  const [seats, setSeats] = useState([]);
  const [seatStatus, setSeatStatus] = useState({
    totalSeats: 0,
    availableSeats: 0,
    occupiedSeats: 0,
    requestedSeats: 0,
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [error, setError] = useState('');
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [isReserving, setIsReserving] = useState(false); // track reservation status to not allow the user to perform shenanigans

  const [alreadyReserved, setAlreadyReserved] = useState(false)
  const [showModal, setShowModal] = useState(false);



  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeatStatuses = async () => {
      try {
        const seatStatuses = await API.getStatusByType(type);
        setSeats(seatStatuses);
        updateSeatStatus(seatStatuses);
      } catch (error) {
        console.error(error);
        // Handle error
      }
    };
    const checkAlreadyReserved = () => {
      if (loggedIn) {

        const existingReservation = userReservations.find(
          (reservation) => reservation.planeType === type
        );

        if (existingReservation) {
          setAlreadyReserved(true);
          setShowModal(true);
        } else {
          setAlreadyReserved(false);
          setShowModal(false);
        }
      }
    };

    fetchSeatStatuses();
    checkAlreadyReserved()
  }, [type]);

  useEffect(() => {
    updateSeatStatus(seats);
  }, [seats]);

  const updateSeatStatus = (seats) => {
    const totalSeats = seats.length;
    const availableSeats = seats.filter((seat) => seat.status === 'available').length;
    const occupiedSeats = seats.filter((seat) => seat.status === 'occupied').length;
    const requestedSeats = seats.filter((seat) => seat.status === 'requested').length;

    setSeatStatus({
      totalSeats,
      availableSeats,
      occupiedSeats,
      requestedSeats,
    });
  };

  const getBookedSeats = () => {
    const reservation = userReservations.find(reservation => reservation.planeType === type);
    
    if (reservation) {
      return reservation.seats.map(seat => seat.seat).join(', ');
    }
    
    return '';
  };

  const reserveSeat = (seatId, seatCode) => {
    if (!loggedIn) {
      return; // Do nothing if not logged in
    }

    const updatedSeats = seats.map((seat) => {
      if (seat.id === seatId) {
        if (seat.status === 'available') {
          seat.status = 'requested';
          setSelectedSeats((prevSelectedSeats) => [...prevSelectedSeats, seatCode]);
        } else if (seat.status === 'requested') {
          seat.status = 'available';
          setSelectedSeats((prevSelectedSeats) =>
            prevSelectedSeats.filter((selectedSeat) => selectedSeat !== seatCode)
          );
        }
      }
      return seat;
    });

    setSeats(updatedSeats);
    updateSeatStatus(updatedSeats);
  };

  const resetSeats = () => {
    const resettedSeats = seats.map((seat) => {
      if (seat.status === 'requested') {
        seat.status = 'available';
      }
      return seat;
    });

    setSeats(resettedSeats);
    setSelectedSeats([]);
    updateSeatStatus(resettedSeats);
  };

  const handleSeatSelection = () => {
    resetSeats();

    const availableSeats = seats.filter((seat) => seat.status === 'available');
    const selected = availableSeats.slice(0, numberOfSeats);

    if (selected.length === 0) {
      setError('No suitable seats found');
      return;
    }

    if (numberOfSeats > availableSeats.length) {
      setError('Not enough available seats');
      return;
    }

    const selectedSeatCodes = selected.map((seat) => seat.row + seat.position);

    const updatedSeats = seats.map((seat) => {
      if (selectedSeatCodes.includes(seat.row + seat.position)) {
        seat.status = 'requested';
      }
      return seat;
    });

    setSeats(updatedSeats);
    setSelectedSeats(selectedSeatCodes);
    setError('');
  };

  const bookSeats = () => {
    const requestedSeats = selectedSeats.map((seatCode) => {
      const seat = seats.find((seat) => seat.row + seat.position === seatCode);
      return { seat: seat.row + seat.position, id: seat.id };
    });

    const reservation = {
      userId: userId,
      type: type,
      seats: requestedSeats,
    };

    setReservationDetails(reservation);
    setShowPopup(true);
  };

  const confirmReservation = async () => {

    setShowPopup(false);

    const requestedSeats = selectedSeats.map((seatCode) => {
      const seat = seats.find((seat) => seat.row + seat.position === seatCode);
      return { seat: seat.row + seat.position, id: seat.id };
    });

    const reservation = {
      userId: userId,
      type: type,
      seats: requestedSeats,
    };

    try {

      setIsReserving(true); // Set isReserving to true during the reservation process

      await API.createReservation(reservation);
      setIsReserving(false); // Set isReserving to true during the reservation process
      onBook()
      resetSeats();
      navigate('/');
    } catch (error) {
      resetSeats();

      console.log(error);
      if (error.occupiedSeats) {
        // Update the occupied seats state
        setOccupiedSeats(error.occupiedSeats);

        //show error?
        setError('Error! Some seats are not available anymore! Check again the grid! You can try to book again in a moment.');

        // Blink the occupied seats for 5 seconds
        const blinkInterval = setInterval(() => {
          setSeats((prevSeats) => {
            const updatedSeats = [...prevSeats];
            error.occupiedSeats.forEach((seatId) => {
              const seatIndex = updatedSeats.findIndex((seat) => seat.id === seatId);
              if (seatIndex !== -1) {
                const updatedSeat = { ...updatedSeats[seatIndex], status: 'occupied' };
                updatedSeats[seatIndex] = updatedSeat;
              }
            });
            return updatedSeats;
          });
        }, 500); // Blink every 500ms

        // After 5 seconds, stop blinking and clear the occupied seats
        setTimeout(() => {
          clearInterval(blinkInterval);
          setOccupiedSeats([]);
          setError(''); // Clear the error message
          setIsReserving(false); // Set isReserving to true during the reservation process


        }, 5000);
      }
    }
  };



  const renderSeatGrid = () => {
    let seatsPerRow;

    switch (type) {
      case 'local':
        seatsPerRow = 4;
        break;
      case 'regional':
        seatsPerRow = 5;
        break;
      case 'international':
        seatsPerRow = 6;
        break;
      default:
        seatsPerRow = 4;
        break;
    }

    const rows = Math.ceil(seats.length / seatsPerRow);
    const seatChunks = Array.from({ length: rows }, (_, index) => seats.slice(index * seatsPerRow, index * seatsPerRow + seatsPerRow));

    return (
      <div className="seat-grid mt-5 pt-3">
        {seatChunks.map((chunk, rowIndex) => (
          <Row key={rowIndex} className="justify-content-center mb-2">
            {chunk.map((seat) => (
              <Col key={seat.id} xs="auto">
                <Button
                  className={`seat ${seat.status} ${occupiedSeats.includes(seat.id) ? 'blink' : ''}`}
                  onClick={() => reserveSeat(seat.id, seat.row + seat.position)}
                  disabled={!loggedIn || seat.status === 'occupied' || isReserving || alreadyReserved}
                  style={{ width: '40px', height: '40px', padding: '0' }}
                >
                  {seat.row}
                  {seat.position}
                </Button>
              </Col>
            ))}
          </Row>
        ))}
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Card className="w-100">
        <Card.Header as="h5" className="bg-primary text-white text-center">Current Seats for our {type} plane:</Card.Header>
      </Card>
      <Row>
        {showPopup && (
          <div className="reservation-popup">
            <Card>
              <Card.Header as="h5">Reservation Details</Card.Header>
              <Card.Body>
                {/* Display reservation details */}
                <p>User ID: {reservationDetails.userId}</p>
                <p>Type: {reservationDetails.type}</p>
                <p>Seats: {reservationDetails.seats.map((seat) => seat.seat).join(', ')}</p>

                {/* Confirm and cancel buttons */}
                <div className="d-flex justify-content-end">
                  <Button variant="primary" onClick={confirmReservation}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={() => { setShowPopup(false); resetSeats(); }}>
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
        <Col xs={12} md={6} className="mt-5 justify-content-center">
          <Card className="booking-form">
            <Card.Header as="h5" className="bg-primary text-white">Booking Form</Card.Header>
            <Card.Body>
              <div>
                <p>Total Seats: {seatStatus.totalSeats}</p>
                <p>Available Seats: {seatStatus.availableSeats}</p>
                <p>Occupied Seats: {seatStatus.occupiedSeats}</p>
                {loggedIn && !alreadyReserved && (
                  <>
                    <p>Requested Seats: {seatStatus.requestedSeats}</p>
                    <Form.Label className="mr-3">Enter a number here for autofind:</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min="1"
                        max={seatStatus.availableSeats}
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
                      />
                      <Button variant="primary" onClick={handleSeatSelection} disabled={!loggedIn}>
                        Autofind!
                      </Button>
                    </div>
                  </>
                )}
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}                {loggedIn && selectedSeats.length > 0 && (
                  <>
                    <p className="selected-seats-label mt-3">Selected Seats:</p>
                    <p className='selected-seat mt-3'> {selectedSeats.join(', ')}</p>
                    <div className="d-flex justify-content-center align-items-center">
                      <Button variant="danger" onClick={resetSeats} disabled={isReserving}>
                        Reset
                      </Button>
                      <Button variant="success" onClick={bookSeats} disabled={isReserving}>
                        Book now!
                      </Button>
                    </div>
                  </>
                )}
                {!loggedIn &&
                  <p>Perform   <Link to="/login"> LOGIN </Link> to Book!</p>}

                {alreadyReserved && loggedIn &&(
                <>
                <p>You already have a reservation for this plane.</p>
                <p className="selected-seats-label mt-3">Booked Seats:</p>
                <p className='selected-seat mt-3'> {getBookedSeats(userReservations, type)}</p>
                
                </>
                )}
               
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reservation Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You already have a reservation for the {type} plane.</p>
            <p>If you want to book again for this plane you need to delete your previous reservation from the <Link to ='/planes'> HOMEPAGE</Link></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Col xs={12} md={6} className="mb-4">
          <div className="scrollable-grid">{renderSeatGrid()}</div>
        </Col>
      </Row>
    </Container>
  );



};

export default Status;
