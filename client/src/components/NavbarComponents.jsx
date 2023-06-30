import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';
import Wing from '../assets/wing.svg';
import User from '../assets/user.png';
function NavHeader(props) {
  return (
  <Navbar bg="primary" variant="dark">
    <Container fluid>
      <Link to='/' className='navbar-brand'>
      <img src={Wing} style={{ width: '45px', height: 'auto', fill: 'white' }} alt="Wing" />
        Faloppa's Wings
      </Link>
      
      <Link to='/'className='btn btn-outline-light'>HOME</Link>

      {props.loggedIn ? <>
      <Navbar.Text>
        
      <img src={User} style={{ width: '45px', height: 'auto', fill: 'white' }} alt="User:" />
        <span className="text-light me-3 username">{props.user.username}</span>
      </Navbar.Text>
        <LogoutButton logout={props.handleLogout} />
        </> :
        <Link to='/login'className='btn btn-outline-light'>Login</Link>
         }
    </Container>
  </Navbar>
  );
}

export default NavHeader;