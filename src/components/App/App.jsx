import { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import "./App.css";

import FilterContextProvider from "../FilterContextProvider/FilterContextProvider";

import Header from "../Header/Header";
import Main from "../Main/Main";
import AddActivityButton from "../AddActivityButton/AddActivityButton";
import Footer from "../Footer/Footer";
import MyActivities from "../MyActivities/MyActivities";

import AddActivityFormModal from "../AddActivityFormModal/AddActivityFormModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";
import ForgotPasswordModal from "../ForgotPasswordModal/ForgotPasswordModal";
import EditProfileModal from "../EditProfileModal/EditProfileModal";
import ChangePasswordModal from "../ChangePasswordModal/ChangePasswordModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import LogoutConfirmationModal from "../LogoutConfirmationModal/LogoutConfirmationModal";

import Preloader from "../Preloader/Preloader";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import { useEscClose } from "../../hooks/useEscClose";

import UserContext from "../../contexts/UserContext";
import WeatherContext from "../../contexts/WeatherContext";
import ActivitiesContext from "../../contexts/ActivitiesContext";
import LoadingContext from "../../contexts/LoadingContext";
import DeleteContext from "../../contexts/DeleteContext";

import { getWeather, filterWeatherData } from "../../api/weatherApi";
import { getCurrentPosition } from "../../utils/geolocation";
import { fetchCoordinatesByCity } from "../../utils/location";
import { weatherAPIkey } from "../../constants/apiEndpoints";

import * as activitiesApi from "../../api/activitiesApi";
import * as usersApi from "../../api/usersApi";
import * as auth from "../../api/auth";
import * as token from "../../utils/token";

export default function App() {
  const [weatherData, setWeatherData] = useState({
    city: "",
    temp: { F: 999, C: 999 },
    latitude: "",
    season: "",
    isOutdoor: false,
    condition: "",
    id: "",
    isDay: true,
    icon: "",
  });

  const [currentUser, setCurrentUser] = useState({
    _id: "",
    name: "",
    email: "",
    createdAt: "",
    savedActivities: [],
    completedActivities: [],
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeModal, setActiveModal] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    variant: null,
    card: null,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const location = useLocation();
  const navigate = useNavigate();
  const isMyActivitiesPage = location.pathname === "/my-activities";

  const savedActivities = activities.filter((activity) => activity.isSaved);
  const completedActivities = activities.filter(
    (activity) => activity.isCompleted,
  );

  // --- AUTHENTICATION ---
  useEffect(() => {
    const tokenValue = token.getToken();
    if (!tokenValue) {
      setIsAuthenticating(false);
      setIsLoggedIn(false);
      return;
    }

    usersApi
      .getCurrentUser()
      .then((user) => {
        setCurrentUser({
          ...user,
          savedActivities: user.savedActivities || [],
          completedActivities: user.completedActivities || [],
        });
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        token.removeToken();
        setCurrentUser({
          _id: "",
          name: "",
          email: "",
          createdAt: "",
        });
        setIsLoggedIn(false);
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }, []);

  // --- FETCH ACTIVITIES ---
  useEffect(() => {
    setIsLoading(true);
    activitiesApi
      .getActivities()
      .then((data) => {
        setActivities(
          data.map((activity) => ({
            ...activity,
            isSaved:
              currentUser.savedActivities?.some(
                (saved) => saved._id === activity._id,
              ) ?? false,
            isCompleted:
              currentUser.completedActivities?.some(
                (completed) => completed._id === activity._id,
              ) ?? false,
          })),
        );
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  // --- FETCH WEATHER ---
  // useEffect(() => {
  //   setIsLoading(true);
  //   fetchCoordinatesByCity("Cincinnati", weatherAPIkey)
  //     .then((coordinates) => getWeather(coordinates, weatherAPIkey))
  //     .then((data) => {
  //       const filteredData = filterWeatherData(data);
  //       setWeatherData(filteredData);
  //     })
  //     .catch(console.error)
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    setIsLoading(true);

    getCurrentPosition()
      .then((coordinates) => getWeather(coordinates, weatherAPIkey))
      .then((data) => {
        const filteredData = filterWeatherData(data);
        setWeatherData(filteredData);
      })
      .catch((geoError) => {
        // Geolocation failed, fall back to Cincinnati
        console.log("Using default location:", geoError.message);
        return fetchCoordinatesByCity("Cincinnati", weatherAPIkey)
          .then((coordinates) => getWeather(coordinates, weatherAPIkey))
          .then((data) => {
            const filteredData = filterWeatherData(data);
            setWeatherData(filteredData);
          });
      })
      .catch((weatherError) => {
        console.error("Failed to fetch weather:", weatherError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // --- RESPONSIVE DESIGN ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- UI HANDLERS ---

  const openModal = (modalName) => setActiveModal(modalName);
  const closeActiveModal = useCallback(() => setActiveModal(""), []);

  const openDeleteConfirmationModal = (variant, card = null) =>
    setDeleteConfig({ isOpen: true, variant, card });
  const closeDeleteConfirmationModal = () =>
    setDeleteConfig({ isOpen: false, variant: null, card: null });

  const handleEscClose = useCallback(() => {
    if (activeModal) {
      closeActiveModal();
    } else if (deleteConfig.isOpen) {
      closeDeleteConfirmationModal();
    }
  }, [
    activeModal,
    deleteConfig,
    closeActiveModal,
    closeDeleteConfirmationModal,
  ]);

  useEscClose(handleEscClose, activeModal || deleteConfig.isOpen);

  // --- ACTION FUNCTIONS ---
  const handleSubmit = (req) => {
    setIsLoading(true);
    return req()
      .then((res) => {
        closeActiveModal();
        return res;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRegistration = (formValues, setErrorMessage) => {
    const { email, password, confirmPassword, name } = formValues;
    if (password !== confirmPassword) {
      setErrorMessage((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return Promise.reject(new Error("Passwords do not match"));
    }

    const makeRequest = () => {
      return auth
        .register(email, password, name)
        .then((data) => {
          token.setToken(data.token);
          setIsLoggedIn(true);
          setCurrentUser({
            _id: data._id || "",
            name: data.name || "",
            email: data.email || "",
            createdAt: data.createdAt || "",
            savedActivities: data.savedActivities || [],
            completedActivities: data.completedActivities || [],
          });

          setErrorMessage({});

          const redirectPath = location.state?.from?.pathname || "/";
          navigate(redirectPath);

          return data.user;
        })
        .catch((error) => {
          if (error.status === 409) {
            setErrorMessage((prev) => ({
              ...prev,
              email: error.message,
            }));
          } else {
            setErrorMessage((prev) => ({
              ...prev,
              general: error.message || "Registration failed",
            }));
          }
          throw error;
        });
    };
    return handleSubmit(makeRequest);
  };

  const handleLogin = (formValues, setErrorMessage) => {
    const { email, password } = formValues;

    if (!email || !password) {
      setErrorMessage((prev) => ({
        ...prev,
        general: "Please fill out all fields",
      }));
      return Promise.reject(new Error("Missing credentials"));
    }

    const makeRequest = () => {
      return auth
        .login(email, password)
        .then((data) => {
          if (data.token) {
            token.setToken(data.token);

            setCurrentUser({
              _id: data._id || "",
              name: data.name || "",
              email: data.email || "",
              createdAt: data.createdAt || "",
              savedActivities: data.savedActivities || [],
              completedActivities: data.completedActivities || [],
            });

            setIsLoggedIn(true);
            setErrorMessage({});
            closeActiveModal();

            const redirectPath = location.state?.from?.pathname || "/";
            navigate(redirectPath);
          }
        })
        .catch((error) => {
          setErrorMessage((prev) => ({
            ...prev,
            general: "Incorrect email or password",
          }));
          throw error;
        });
    };
    return handleSubmit(makeRequest);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({
      _id: "",
      name: "",
      email: "",
      createdAt: currentUser.createdAt,
      savedActivities: currentUser.savedActivities,
      completedActivities: currentUser.completedActivities,
    });
    token.removeToken();
    navigate("/");
  };

  const handleUpdateProfile = (updatedValues) => {
    const makeRequest = () =>
      usersApi.updateUser(updatedValues).then((updatedUser) => {
        setCurrentUser({
          ...updatedUser,
          savedActivities: updatedUser.savedActivities || [],
          completedActivities: updatedUser.completedActivities || [],
        });

        return updatedUser;
      });

    return handleSubmit(makeRequest);
  };

  const handleAddActivity = (activityData) => {
    const makeRequest = () => {
      const newActivity = {
        ...activityData,
        isSaved: false,
        isCompleted: false,
      };

      return activitiesApi
        .createActivity(newActivity)
        .then((savedActivity) => {
          setActivities((prev) => [savedActivity, ...prev]);
          return savedActivity;
        })
        .catch((error) => {
          console.error("Error adding activity:", error);
          alert(`Error adding activity: ${error.message}`);
          throw error;
        });
    };
    return handleSubmit(makeRequest);
  };

  const handleUpdatePassword = ({ oldPassword, newPassword }) => {
    const makeRequest = () => {
      return usersApi
        .updatePassword({ oldPassword, newPassword })
        .then(() => {})
        .catch((error) => {
          if (error.message === "No authentication token found") {
          } else {
            console.error("Password update failed:", error);
          }
          throw error;
        });
    };

    return handleSubmit(makeRequest);
  };

  const handleForgotPassword = (email, setErrorMessage, setMessage) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return Promise.reject(new Error("Invalid email format"));
    }

    setErrorMessage("");
    setMessage("");

    const makeRequest = () => usersApi.forgotPassword(email);

    return handleSubmit(makeRequest)
      .then(() => {
        setMessage(
          "If an account with that email exists, you'll receive a reset link.",
        );
      })
      .catch(() => {
        // Always show the same message to avoid exposing which emails exist
        setMessage(
          "If an account with that email exists, you'll receive a reset link.",
        );
      });
  };

  const handleDeleteAccount = () => {
    const makeRequest = () =>
      usersApi.deleteUser(currentUser._id).then(() => {
        setCurrentUser({
          _id: "",
          name: "",
          email: "",
          createdAt: "",
        });
        setIsLoggedIn(false);
        token.removeToken();
        navigate("/");
      });

    return handleSubmit(makeRequest);
  };

  const handleDeleteActivity = (activity) => {
    const makeRequest = () => {
      return activitiesApi
        .deleteActivity(activity._id)
        .then(() => {
          setActivities((prev) => prev.filter((a) => a._id !== activity._id));
        })
        .catch((error) => {
          console.error("Delete activity error:", error);
          alert(`Error deleting activity: ${error.message}`);
          throw error;
        });
    };

    return handleSubmit(makeRequest);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, handleSubmit }}>
      {(isLoading || isAuthenticating) && <Preloader />}
      {!isAuthenticating && (
        <WeatherContext.Provider
          value={{ weatherData, setWeatherData, weatherAPIkey }}
        >
          <UserContext.Provider
            value={{
              currentUser,
              setCurrentUser,
              isLoggedIn,
              isAuthenticating,
              handleLogout,
              handleLogin,
              handleRegistration,
              handleUpdateProfile,
              handleDeleteAccount,
              handleUpdatePassword,
              handleForgotPassword,
              savedActivities,
              completedActivities,
            }}
          >
            <ActivitiesContext.Provider value={{ activities, setActivities }}>
              <FilterContextProvider>
                <DeleteContext.Provider
                  value={{
                    deleteConfig,
                    openDeleteConfirmationModal,
                    closeDeleteConfirmationModal,
                  }}
                >
                  <div className="page">
                    <div className="page__content">
                      <Header
                        openModal={openModal}
                        onDeleteAccountClick={() =>
                          openDeleteConfirmationModal("account")
                        }
                        isMobile={isMobile}
                        isMyActivitiesPage={isMyActivitiesPage}
                      />

                      <Routes>
                        <Route path="/" element={<Main />} />

                        <Route
                          path="/my-activities"
                          element={
                            <ProtectedRoute setActiveModal={setActiveModal}>
                              <MyActivities />
                            </ProtectedRoute>
                          }
                        ></Route>
                      </Routes>

                      {isLoggedIn && activeModal !== "add-activity" && (
                        <AddActivityButton
                          onClick={() => openModal("add-activity")}
                        />
                      )}

                      <Footer isMobile={isMobile} />

                      <AddActivityFormModal
                        isOpen={activeModal === "add-activity"}
                        onClose={closeActiveModal}
                        handleAddActivity={handleAddActivity}
                      />

                      <RegisterModal
                        isOpen={activeModal === "register-modal"}
                        onClose={closeActiveModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                      />
                      <LoginModal
                        isOpen={activeModal === "login-modal"}
                        onClose={closeActiveModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                      />
                      <ForgotPasswordModal
                        isOpen={activeModal === "forgot-password-modal"}
                        onClose={closeActiveModal}
                      />
                      <EditProfileModal
                        isOpen={activeModal === "edit-profile"}
                        onClose={closeActiveModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                      />
                      <ChangePasswordModal
                        isOpen={activeModal === "change-password"}
                        onClose={closeActiveModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                      />
                      <LogoutConfirmationModal
                        isOpen={activeModal === "logout-confirmation"}
                        onClose={closeActiveModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                      />
                      <DeleteConfirmationModal
                        isOpen={deleteConfig.isOpen}
                        onClose={closeDeleteConfirmationModal}
                        activeModal={activeModal}
                        setActiveModal={setActiveModal}
                        card={deleteConfig.card}
                        variant={deleteConfig.variant}
                        onDelete={(card) => {
                          if (deleteConfig.variant === "account") {
                            handleDeleteAccount();
                          } else if (deleteConfig.variant === "activity") {
                            handleDeleteActivity(card);
                          }
                          closeDeleteConfirmationModal();
                        }}
                      />
                    </div>
                  </div>
                </DeleteContext.Provider>
              </FilterContextProvider>
            </ActivitiesContext.Provider>
          </UserContext.Provider>
        </WeatherContext.Provider>
      )}
    </LoadingContext.Provider>
  );
}
