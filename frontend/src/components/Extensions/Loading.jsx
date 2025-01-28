import React from "react";
import "../../styles/Loading.css";
import { useTranslation } from "react-i18next";

function Loading() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center flex-col z-10 top-0 left-0 w-full h-[100vh] bg-black/80">
      <div className="loader">
        <span className="loader-text">{t("forms.loading")}</span>
        <span className="load"></span>
      </div>
    </div>
  );
}

export default Loading;
