import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import API from '../API.js';
import '../App.css';

const Status = ({ loggedIn }) => {
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
    fetchSeatStatuses();
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

    const selectedSeatCodes = selected.map((seat) => seat.row + seat.position);

    const updatedSeats = seats.map((seat) => {
      if (selectedSeatCodes.includes(seat.row + seat.position)) {
        return { ...seat, status: 'requested' };
      }
      return seat;
    });

    setSeats(updatedSeats);
    setSelectedSeats(selectedSeatCodes);
    updateSeatStatus(updatedSeats);
    setError('');
  };

  const handleNumberOfSeatsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfSeats(value > 0 ? value : 1);
    setError('');
    resetSeats();
  };

  const renderSeatGrid = () => {
    const rows = Math.ceil(seats.length / 4); // Adjust the number 4 to the desired number of seats per row
    const seatChunks = Array.from({ length: rows }, (_, index) => seats.slice(index * 4, index * 4 + 4));

    return (
      <>
        {seatChunks.map((chunk, rowIndex) => (
          <Row key={rowIndex} className="justify-content-center mb-2">
            {chunk.map((seat) => (
              <Col key={seat.id} xs="auto">
                <Button
                  className={`seat ${seat.status} ${selectedSeats.includes(seat.row + seat.position) ? 'selected' : ''}`}
                  onClick={() => reserveSeat(seat.id, seat.row + seat.position)}
                  disabled={!loggedIn || seat.status === 'occupied'}
                  style={{ width: '60px', height: '60px', padding: '0' }}
                >
                  {seat.row}
                  {seat.position}
                </Button>
              </Col>
            ))}
          </Row>
        ))}
      </>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="sidebar">
          <div className="sidebar-content">
            <h3>Seat Status</h3>
            {loggedIn && (
              <div>
                <Row>
                  <Col>
                    <p>Total Seats: {seatStatus.totalSeats}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p>Available Seats: {seatStatus.availableSeats}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p>Occupied Seats: {seatStatus.occupiedSeats}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p>Requested Seats: {seatStatus.requestedSeats}</p>
                  </Col>
                </Row>
                {selectedSeats.length > 0 && (
                  <Row>
                    <Col>
                      <p className="text-danger">Selected/Reserved Seats: {selectedSeats.join(', ')}</p>
                    </Col>
                  </Row>
                )}
                <Form>
                  <Form.Group controlId="formNumberOfSeats">
                    <Form.Label>Number of Seats</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={numberOfSeats}
                      onChange={handleNumberOfSeatsChange}
                    />
                  </Form.Group>
                  <Button onClick={handleSeatSelection}>Reserve</Button>
                  {error && <p className="text-danger">{error}</p>}
                </Form>
              </div>
            )}
          </div>
        </Col>
        <Col md={10} className="main-content">
          <Row>
            <h1 className="mt-4">Seat Statuses - {type} Plane</h1>
          </Row>
          {renderSeatGrid()}
        </Col>
      </Row>
    </Container>
  );
};

export default Status;
