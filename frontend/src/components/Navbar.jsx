import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, signOut } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="site-header">
      <Link className="brand" to="/products">
        <span className="brand-mark">T</span>
        <span>Technuvex</span>
      </Link>
      <nav className="nav-links">
        <Link to="/products">Storefront</Link>
        {user?.isAdmin && <Link to="/admin">Admin studio</Link>}
        {user ? (
          <button className="button button-ghost" onClick={logout}>
            Sign out
          </button>
        ) : (
          <Link className="button button-dark" to="/">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
