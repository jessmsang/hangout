import { useContext } from "react";
import { Link } from "react-router-dom";

import "./Header.css";

import WeatherDisplay from "../WeatherDisplay/WeatherDisplay";
import LocationDisplay from "../LocationDisplay/LocationDisplay";
import Logo from "../Logo/Logo";
import AccountDropdown from "../AccountDropdown/AccountDropdown";

import UserContext from "../../contexts/UserContext";

export default function Header({
  openModal,
  isMobileAuthorized,
  isMobileUnauthorized,
}) {
  const { isLoggedIn, handleLogout } = useContext(UserContext);

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__mobile-top-container">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          {isLoggedIn && isMobileAuthorized && (
            <div className="header__mobile-dropdown-location">
              <AccountDropdown
                onEditProfileClick={() => openModal("edit-profile")}
                onChangePasswordClick={() => openModal("change-password")}
                onLogoutClick={() => openModal("logout-confirmation")}
              />
            </div>
          )}

          {!isLoggedIn && isMobileUnauthorized && (
            <div className="header__mobile-unauthorized-container">
              <ul className="header__unauthorized-view-mobile">
                <li className="header__unauthorized-item-mobile">
                  <button
                    onClick={() => openModal("register-modal")}
                    className="header__unauthorized-btn-mobile"
                  >
                    Sign Up
                  </button>
                </li>
                <li className="header__unauthorized-item-mobile">
                  <button
                    onClick={() => openModal("login-modal")}
                    className="header__unauthorized-btn-mobile"
                  >
                    Log In
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <hr className="header__divider" />
        <div className="header__mobile-middle-container">
          <LocationDisplay />
          <hr className="header__divider" />
          <WeatherDisplay />
        </div>
        <hr className="header__divider" />
      </div>

      {!isLoggedIn && !isMobileUnauthorized && (
        <ul className="header__unauthorized-view">
          <li className="header__unauthorized-item">
            <button
              onClick={() => openModal("register-modal")}
              className="header__unauthorized-btn"
            >
              Sign Up
            </button>
          </li>
          <li className="header__unauthorized-item">
            <button
              onClick={() => openModal("login-modal")}
              className="header__unauthorized-btn"
            >
              Log In
            </button>
          </li>
        </ul>
      )}

      {isLoggedIn && !isMobileAuthorized && (
        <div className="header__authorized-view">
          <AccountDropdown
            onLogout={handleLogout}
            onEditProfileClick={() => openModal("edit-profile")}
            onChangePasswordClick={() => openModal("change-password")}
            onLogoutClick={() => openModal("logout-confirmation")}
          />
        </div>
      )}
    </header>
  );
}
