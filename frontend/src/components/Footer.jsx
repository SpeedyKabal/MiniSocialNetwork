import { useTranslation } from "react-i18next";
import { FaFacebookSquare, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import React from "react";

function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-zinc-50 text-center text-surface/75 dark:bg-neutral-700 dark:text-white/75 lg:text-left  mt-auto">
      <div
        className={`flex items-center justify-center border-b-2 border-neutral-200 p-2 dark:border-white/10 lg:justify-between ${
          i18n.language == "ar" && "flex-row-reverse"
        }`}
      >
        <div className="hidden lg:block text-md">
          <span>{t("footer.spantext")}</span>
        </div>
        {/* <!-- Social network icons container --> */}
        <div className="flex justify-center">
          <a
            href="https://www.facebook.com/dzephelhadjira"
            className="me-6"
            target="_blanck"
          >
            <span className="text-md text-indigo-500 hover:text-red-500">
              <FaFacebookSquare />
            </span>
          </a>
          <a
            href="https://x.com/ephelhadjira"
            className="me-6"
            target="_blanck"
          >
            <span className="text-md text-indigo-500 hover:text-red-500">
              <FaXTwitter />
            </span>
          </a>
          <a
            href="https://www.youtube.com/channel/UC59gDd7dG4_QHnMlsJqheEw"
            className="me-6"
            target="_blanck"
          >
            <span className="text-md text-indigo-500 hover:text-red-500">
              <FaYoutube />
            </span>
          </a>
        </div>
      </div>
      <div className="bg-black/5 p-1 text-center flex justify-center align-middle items-center">
        <span className=" font-semibold text-md">© 2024 Copyright:&nbsp;</span>
        <p className=" font-bold text-md">EPH El Hadjira (DSI)</p>
      </div>
    </footer>
  );
}

export default Footer;
