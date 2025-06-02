import { useState, useRef, useEffect, FormEvent } from "react";
import api, { startTokenRefresh } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ChangeLanguages from "../components/Extensions/ChangeLanguages";

function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const usernameInput = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    usernameInput.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await api.post("api/token/", { username, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      startTokenRefresh(); // Start token refresh interval after login
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred";

      if (errorMessage !== 'User not found') {
        setError(t("forms.invalidPassword"));
      } else {
        setError(t("forms.userNotFound"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex h-screen bg-gray-100 justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center">
        <ChangeLanguages />
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">{t("forms.login")}</h2>
          {error && (
            <div className="text-red-500 text-sm font-medium text-center">{error}</div>
          )}
          {location.search && (
            <div className="text-green-700 text-sm font-medium text-center bg-green-100 p-2 rounded-lg">
              {decodeURIComponent(location.search.split("=")[1])}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t("forms.userOrEmail")}
            </label>
            <input
              type="text"
              name="username"
              ref={usernameInput}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t("forms.userOrEmail")}
              autoComplete="On"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t("forms.password")}
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={t("forms.password")}
                autoComplete="On"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaRegEye className="text-gray-400" /> : <FaRegEyeSlash className="text-gray-400" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? <Loading /> : t("forms.login")}
          </button>
        </form>
        <div className="mt-6 space-y-4">
          <Link
            to="/change-password"
            className="block text-center text-indigo-600 hover:text-indigo-500"
          >
            {t("forms.resetPassword")}
          </Link>
          <div className="text-center text-gray-500">
            {t("forms.no_account")}{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {t("forms.register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
