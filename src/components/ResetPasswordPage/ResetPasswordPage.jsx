import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import LoadingContext from "../../contexts/LoadingContext";

import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const { token } = useParams(); // token from URL: /reset-password/:token
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const [generalMessage, setGeneralMessage] = useState("");

  const BACKEND_URL =
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_BACKEND_URL_PROD
      : import.meta.env.VITE_BACKEND_URL_LOCAL;

  const { values, handleChange, errorMessage, hasErrors, isValid, resetForm } =
    useForm(
      {
        newPassword: "",
        confirmNewPassword: "",
      },
      {
        matchFields: {
          field: "newPassword",
          confirmField: "confirmNewPassword",
        },
        patternFields: {
          newPassword: /^(?=.*[A-Z])(?=.*[!@#$%^&*_+\-=?]).{8,50}$/,
        },
      },
    );

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (hasErrors) return;

    setIsLoading(true);
    setGeneralMessage("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/users/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: values.newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setGeneralMessage(data.message || "Something went wrong");
      } else {
        setGeneralMessage(
          data.message ||
            "Password reset successfully! Redirecting you to login...",
        );
        resetForm();

        // Redirect user to login after 3 seconds
        setTimeout(() => {
          navigate("/", { state: { openModal: "login-modal" } });
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setGeneralMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2 className="reset-password__title">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="reset-password__form">
          <label
            htmlFor="new-password-input"
            className="reset-password__form-label"
          >
            New Password*
            <input
              type="password"
              name="newPassword"
              id="new-password-input"
              className="reset-password__form-input"
              placeholder="Enter new password"
              disabled={isLoading}
              required
              pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*_+\-=?]).{8,50}$"
              onChange={handleChange}
              value={values.newPassword}
            />
            <span className="modal__error" id="new-password-error">
              {errorMessage.newPassword}
            </span>
          </label>

          <label
            htmlFor="confirm-new-password-input"
            className="reset-password__form-label"
          >
            Confirm New Password*
            <input
              type="password"
              name="confirmNewPassword"
              id="confirm-new-password-input"
              className="reset-password__form-input"
              placeholder="Re-enter new password"
              disabled={isLoading}
              required
              onChange={handleChange}
              value={values.confirmNewPassword}
            />
            <span className="modal__error" id="confirm-new-password-error">
              {errorMessage.confirmNewPassword}
            </span>
          </label>

          <button
            type="submit"
            className="reset-password__form-submit-btn"
            disabled={isLoading || !isValid}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {generalMessage && <p className="general-message">{generalMessage}</p>}
      </div>
    </div>
  );
}
