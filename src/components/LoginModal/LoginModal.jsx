import { useContext } from "react";
import { useForm } from "../../hooks/useForm";

import ModalWithForm from "../ModalWithForm/ModalWithForm";
import UserContext from "../../contexts/UserContext";
import LoadingContext from "../../contexts/LoadingContext";

function LoginModal({ onClose, isOpen, setActiveModal }) {
  const { handleLogin } = useContext(UserContext);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const {
    values,
    handleChange,
    errorMessage,
    setErrorMessage,
    isValid,
    resetForm,
  } = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = (evt) => {
    evt.preventDefault();

    handleLogin(values, setErrorMessage).then(() => {
      resetForm();
      onClose();
    });
  };

  return (
    <ModalWithForm
      variant="login"
      titleText="Log In"
      name="login-modal"
      btnText={isLoading ? "Logging In..." : "Log In"}
      onClose={onClose}
      isOpen={isOpen}
      onSubmit={handleSubmit}
      onNavBtnClick={() => setActiveModal("register-modal")}
      navBtnText="or Sign Up"
      isDisabled={isLoading || !isValid}
    >
      <label htmlFor="login-email-input" className="modal__label">
        Email*
        <input
          type="email"
          name="email"
          id="login-email-input"
          className="modal__input"
          placeholder="Email"
          required
          minLength="1"
          maxLength="30"
          onChange={handleChange}
          value={values.email}
        />
        <span className="modal__error" id="login-email-input-error">
          {errorMessage.email}
        </span>
      </label>
      <label htmlFor="login-password-input" className="modal__label">
        Password*
        <input
          type="password"
          name="password"
          id="login-password-input"
          className="modal__input"
          placeholder="Password"
          required
          minLength="8"
          maxLength="50"
          onChange={handleChange}
          value={values.password}
        />
        <span className="modal__error" id="login-password-input-error">
          {errorMessage.password}
        </span>
      </label>

      <button
        type="button"
        className="modal__forgot-password-btn"
        onClick={() => setActiveModal("forgot-password-modal")}
      >
        Forgot password?
      </button>

      {errorMessage.general && (
        <span className="modal__error modal__error_general">
          {errorMessage.general}
        </span>
      )}
    </ModalWithForm>
  );
}
export default LoginModal;
