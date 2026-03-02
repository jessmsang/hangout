import { useState, useContext, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import UserContext from "../../contexts/UserContext";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");

  const { handleForgotPassword } = useContext(UserContext);

  const {
    values,
    handleChange,
    errorMessage,
    setErrorMessage,
    resetForm,
    isValid,
  } = useForm({
    email: "",
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setMessage("");
    }
  }, [isOpen]);

  const onSubmit = (evt) => {
    evt.preventDefault();

    setErrorMessage({});
    setMessage("");

    handleForgotPassword(values.email, setErrorMessage, setMessage);
  };

  return (
    <ModalWithForm
      variant="forgot-password"
      titleText="Forgot Password?"
      btnText="Send Reset Link"
      onClose={onClose}
      isOpen={isOpen}
      onSubmit={onSubmit}
      showCancel={false}
      isDisabled={!isValid}
    >
      <label htmlFor="forgot-password-email" className="modal__label">
        Enter your email to reset password:
        <input
          type="email"
          name="email"
          className="modal__input"
          placeholder="Email"
          required
          value={values.email}
          onChange={handleChange}
        />
      </label>

      {errorMessage.email && (
        <p className="modal__error">{errorMessage.email}</p>
      )}

      {errorMessage.general && (
        <p className="modal__error">{errorMessage.general}</p>
      )}

      {message && <p className="modal__success">{message}</p>}
    </ModalWithForm>
  );
}
