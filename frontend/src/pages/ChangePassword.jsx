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
        await api.post("/api/sendresetcode/", { email }).then((res) => {
            setResponse(res.data.message);
        }).catch((error) => {
            if (error.response?.data?.error === "No user found with this email") {
                setError(t("forms.errorUserNotFound"));
            } else {
                setError(error.response?.data?.error || error.message || 'An error occurred');
            }
        }).finally(() => {
            setLoading(false);
        });
    }


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
                new_password: newPassword
            });
            setResponse(res.data.message);
            if (res.data.message === "Password updated successfully") {
                window.location.href = "/login?message=" + encodeURIComponent(res.data.message);
            } else {
                setResponse(res.data.message);
            }
        } catch (error) {
            if (error.response?.data?.error === "Reset code expired") {
                setError(t("forms.codeExpired"));
            } else if (error.response?.data?.error === "Invalid reset code") {
                setError(t("forms.invalidCode"));
            } else {
                setError(error.response?.data?.error || error.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <ChangeLanguages />
            {loading && <Loading />}
            <div className="flex flex-col align-middle justify-center items-center h-[100vh] mx-auto px-5 w-full">
                {response !== "" && <div className="bg-indigo-200/95 rounded-lg px-2 py-5 my-4">
                    <span className="text-2xl px-4">{response}</span>
                </div>}
                {response === "" && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-blue-200/90 px-20 flex flex-col gap-2 items-center justify-center align-middle mx-auto h-auto shadow-slate-500 shadow-lg"
                    >
                        <h1 className="w-full text-black text-center text-5xl ">{t("forms.resetPassword")}</h1>
                        {error && <div className="text-red-800 text-2xl font-semibold bg-red-100 p-4 rounded-lg w-full text-center">{error}</div>}
                        <label className="text-2xl m-4 p-4 bg-green-100 rounded-lg w-full text-center">{t("forms.email")}</label>
                        <input
                            type="email"
                            className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemple@exemple.com"
                        />
                        <button
                            type="submit"
                            className="form-button text-center text-green-100 bg-indigo-500 hover:bg-indigo-200 text-3xl py-3 px-3 rounded-lg my-4"
                        >
                            {t("forms.sendResetCode")}
                        </button>
                    </form>
                )}
                {response !== "" && (
                    <form
                        onSubmit={handleVerifyCode}
                        className="bg-blue-200/90 px-20 flex flex-col gap-2 items-center justify-center align-middle mx-auto h-auto shadow-slate-500 shadow-lg"
                    >
                        <h1 className="w-full text-black text-center text-5xl">{t("forms.verifyCode")}</h1>
                        <h2 className="text-2xl">{t("forms.codeExpire")}</h2>
                        {error && <div className="text-red-800 text-2xl font-semibold bg-red-100 p-4 rounded-lg w-full text-center">{error}</div>}
                        <label className="text-2xl m-4 p-4 bg-green-100 rounded-lg w-full text-center">{t("forms.enterVerificationCode")}</label>
                        <input
                            type="text"
                            className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl w-full"
                            value={confimationCode}
                            autoComplete="new-password"
                            onChange={(e) => setConfimationCode(e.target.value)}
                            placeholder="Enter verification code"
                        />
                        <label className="text-2xl m-4 p-4 bg-green-100 rounded-lg w-full text-center">{t("forms.newPassword")}</label>
                        <input
                            type="password"
                            className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl w-full"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                        />
                        <label className="text-2xl m-4 p-4 bg-green-100 rounded-lg w-full text-center">{t("forms.confirmNewPassword")}</label>
                        <input
                            type="password"
                            className="form-input h-20 px-6 rounded-lg border-2 border-solid border-green-500 text-2xl w-full"
                            autoComplete="new-password"
                            value={newPasswordConfirmation}
                            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="submit"
                            className="form-button text-center text-green-100 bg-indigo-500 hover:bg-indigo-200 text-3xl py-3 px-3 rounded-lg my-4"
                        >
                            {t("forms.resetPassword")}
                        </button>
                    </form>
                )}
                {response === '' && (
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
    )
}

export default ChangePassword
