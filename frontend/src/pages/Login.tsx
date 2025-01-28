import React from "react";
import { useState, useRef, useEffect, FormEvent } from "react";
import api from "../api";
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
    <div>
      <div className="flex h-screen flex-wrap justify-center align-middle items-center">
        <div className="mx-auto px-5 w-full flex flex-col align-middle justify-center items-center">
          <ChangeLanguages />
          <form
            onSubmit={handleSubmit}
            className="bg-blue-200/90 px-20 flex flex-col gap-10 items-center justify-center align-middle mx-auto h-auto shadow-slate-500 drop-shadow-lg mt-4"
          >
            <h1 className="w-full text-black text-center text-6xl">Login</h1>
            {error && (
              <div className="text-red-800 text-2xl font-semibold">
                {error}
              </div>
            )}
            {location.search && (
              <div className="text-green-800 text-2xl font-semibold bg-green-100 p-4 rounded-lg">
                {decodeURIComponent(location.search.split("=")[1])}
              </div>
            )}
            <input
              type="text"
              name="username"
              className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
              ref={usernameInput}
              placeholder={t("forms.userOrEmail")}
            />
            <div className="relative form-input h-10 rounded-lg mx-5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
                placeholder={t("forms.password")}
              />
              <button
                type="button"
                className="text-black dark:text-white text-[24px] absolute top-[50%] right-3"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>

            {loading && <Loading />}
            <button
              type="submit"
              className="form-button text-center text-green-100 bg-indigo-500 hover:bg-indigo-200 text-3xl py-3 w-1/2 rounded-lg my-4"
            >
              {t("forms.login")}
            </button>
          </form>

          <div className="bg-indigo-200/95 rounded-lg px-2 py-5 my-4">
            <Link
              to="/change-password"
              className="text-2xl text-blue-600 hover:text-red-600"
            >
              {t("forms.resetPassword")}
            </Link>
          </div>
          <div className="bg-indigo-200/95 rounded-lg px-2 py-5">
            <span className="text-2xl px-4">{t("forms.no_account")}</span>
            <Link
              to="/register"
              className="text-2xl text-blue-600 hover:text-red-600"
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
