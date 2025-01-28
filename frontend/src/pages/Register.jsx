import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import ChangeLanguages from "../components/Extensions/ChangeLanguages";
import Loading from "../components/Extensions/Loading";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordconfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      await api.post("api/user/register/", {
        username: username.toLowerCase(),
        email,
        first_name,
        last_name: last_name.toUpperCase(),
        password,
        password_confirmation,
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        // If the response has data, set the errors state with the error data
        setErrors(error.response.data);
        console.log(error);
      } else {
        // If no specific error data received, display a general error message
        alert("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <ChangeLanguages />
      {loading && <Loading />}
      <div className="flex flex-col align-middle justify-center items-center h-[100vh] mx-auto px-5 w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-blue-200/90 px-20 flex flex-col gap-10 items-center justify-center align-middle mx-auto h-auto shadow-slate-500 drop-shadow-lg"
        >
          <h1 className="w-full text-black text-center text-6xl ">Sign Up</h1>
          <div className="flex gap-10">
            <input
              type="text"
              className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("forms.username")}
            />

            <input
              type="email"
              className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@exemple.com"
            />
          </div>

          <div className="flex gap-10">
            <input
              type="text"
              className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("forms.firstname")}
            />
            <input
              type="text"
              className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("forms.lastname")}
            />
          </div>
          <div className="flex gap-10">
            <div className="relative form-input h-20 rounded-lg border-2 border-solid border-green-500 text-2xl">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input w-full h-full px-6 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("forms.password")}
              />
              <button
                type="button"
                className="text-black dark:text-white text-[24px] absolute top-[50%] -translate-y-[50%] right-2"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>

            <div className="relative form-input h-20 rounded-lg border-2 border-solid border-green-500 text-2xl">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input w-full h-full px-6 rounded-lg"
                value={password_confirmation}
                onChange={(e) => setPasswordconfirmation(e.target.value)}
                placeholder={t("forms.confpassword")}
              />
              <button
                type="button"
                className="text-black dark:text-white text-[24px] absolute top-[50%] -translate-y-[50%] right-2"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>
          {errors.username && (
            <p className="text-red-500 text-3xl">{errors.username}</p>
          )}
          {errors.password && (
            <p className="text-red-500 text-3xl">{errors.password}</p>
          )}
          {errors.non_field_errors && (
            <p className="text-red-500 text-3xl">{errors.non_field_errors}</p>
          )}
          {errors.email && (
            <p className="text-red-500 text-3xl">{errors.email}</p>
          )}
          <button
            type="submit"
            className="form-button text-center text-green-100 bg-indigo-500 hover:bg-indigo-200 text-3xl py-3 w-1/2 rounded-lg my-4"
          >
            {t("forms.register")}
          </button>
        </form>
        <div className="bg-indigo-200/95 rounded-lg px-2 py-5">
          <span className="text-2xl px-4">{t("forms.hasaccount")}</span>
          <Link
            to="/login"
            className="text-2xl text-blue-600 hover:text-red-600"
          >
            {t("forms.login")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
