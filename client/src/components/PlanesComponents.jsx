import { Link } from 'react-router-dom';
import { Container, Row, Col, Image } from 'react-bootstrap';
import localImage from '../assets/local.png';
import nationalImage from '../assets/national.png';
import internationalImage from '../assets/international.png';

const Planes = () => {
  return (
    <Container>
      <h1 className="text-center mt-4">Welcome to Faloppa Airlines!</h1>
      <Row className="justify-content-center mt-4">
        <Col xs={12} sm={4} className="text-center">
          <Link to="/planes/local">
            <Image src={localImage} alt="Local Plane" fluid className="mb-3" />
            <h3>Local Plane</h3>
          </Link>
        </Col>
        <Col xs={12} sm={4} className="text-center">
          <Link to="/planes/regional">
            <Image src={nationalImage} alt="Regional Plane" fluid className="mb-3" />
            <h3>Regional Plane</h3>
          </Link>
        </Col>
        <Col xs={12} sm={4} className="text-center">
          <Link to="/planes/international">
            <Image src={internationalImage} alt="International Plane" fluid className="mb-3" />
            <h3>International Plane</h3>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Planes;
