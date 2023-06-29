import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';
import Wing from '../assets/wing.svg';
function NavHeader(props) {
  return (
  <Navbar bg="primary" variant="dark">
    <Container fluid>
      <Link to='/' className='navbar-brand'>
      <img src={Wing} style={{ width: '45px', height: 'auto', fill: 'white' }} alt="Wing" />
        Faloppa Wings
      </Link>
      {props.loggedIn ? 
        <LogoutButton logout={props.handleLogout} /> :
        <Link to='/login'className='btn btn-outline-light'>Login</Link>
         }
    </Container>
  </Navbar>
  );
}

export default NavHeader;