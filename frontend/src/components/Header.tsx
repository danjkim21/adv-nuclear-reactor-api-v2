import '../App.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="section__header">
      <nav className="nav">
        <ul className="navList">
          <li className="navList_items">
            <Link
              className="navList_link"
              to="/"
            >
              Home
            </Link>
          </li>
          <li className="navList_items">
            <Link
              className="navList_link"
              to="/about"
            >
              About
            </Link>
          </li>
          <li className="navList_items">
            <Link
              className="navList_link"
              to="/dev"
            >
              Developers
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
