import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import ChangeLanguages from "../components/Extensions/ChangeLanguages";

function ChangePassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [confimationCode, setConfimationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await api
      .post("/api/sendresetcode/", { email })
      .then((res) => {
        setResponse(res.data.message);
      })
      .catch((error) => {
        if (error.response?.data?.error === "No user found with this email") {
          setError(t("forms.errorUserNotFound"));
        } else {
          setError(
            error.response?.data?.error || error.message || "An error occurred"
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (newPassword !== newPasswordConfirmation) {
      alert("Passwords don't match");
      setLoading(false);
      return;
    }
    try {
      const res = await api.post("/api/verifyresetcode/", {
        email,
        code: confimationCode,
        new_password: newPassword,
      });
      setResponse(res.data.message);
      if (res.data.message === "Password updated successfully") {
        window.location.href =
          "/login?message=" + encodeURIComponent(res.data.message);
      } else {
        setResponse(res.data.message);
      }
    } catch (error) {
      if (error.response?.data?.error === "Reset code expired") {
        setError(t("forms.codeExpired"));
      } else if (error.response?.data?.error === "Invalid reset code") {
        setError(t("forms.invalidCode"));
      } else {
        setError(
          error.response?.data?.error || error.message || "An error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center">
        <ChangeLanguages />
        {loading && <Loading />}
        {response !== "" && (
          <div className="bg-indigo-200/95 rounded-lg px-2 py-5 my-4">
            <span className="text-2xl px-4">{response}</span>
          </div>
        )}
        {response === "" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              {t("forms.resetPassword")}
            </h2>
            {error && (
              <div className="text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("forms.email")}
              </label>
              <input
                type="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@exemple.com"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("forms.sendResetCode")}
            </button>
          </form>
        )}
        {response !== "" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              {t("forms.verifyCode")}
            </h2>
            <h2 className="text-2xl">{t("forms.codeExpire")}</h2>
            {error && (
              <div className="text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="confimationCode"
                className="block text-sm font-medium text-gray-700"
              >
                {t("forms.enterVerificationCode")}
              </label>
              <input
                type="text"
                name="confimationCode"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={confimationCode}
                autoComplete="new-password"
                onChange={(e) => setConfimationCode(e.target.value)}
                placeholder="Enter verification code"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t("forms.newPassword")}
              </label>
              <input
                type="password"
                name="newPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div>
              <label
                htmlFor="newPasswordConfirmation"
                className="block text-sm font-medium text-gray-700"
              >
                {t("forms.confirmNewPassword")}
              </label>
              <input
                type="password"
                name="newPasswordConfirmation"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autoComplete="new-password"
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("forms.resetPassword")}
            </button>
          </form>
        )}
        {response === "" && (
          <div className="bg-indigo-200/95 rounded-lg px-2 py-5">
            <span className="text-2xl px-4">{t("forms.hasaccount")}</span>
            <Link
              to="/login"
              className="text-2xl text-blue-600 hover:text-red-600"
            >
              {t("forms.login")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePassword;
