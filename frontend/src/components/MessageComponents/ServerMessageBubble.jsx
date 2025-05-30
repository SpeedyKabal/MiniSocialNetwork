import { useTranslation } from "react-i18next";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { formatTime, convertLinksInsideMessages, contentDisplay } from "../../services/Utilities";
import Media from "../PostComponents/Media";

const ServerMessageBubble = ({ message, currentUserID }) => {
  const { t, i18n } = useTranslation();

  if (message.sender.id === currentUserID) {
    return (
      <div className="flex mb-2 mr-[25%]">
        <div className="rounded py-1 px-1 bg-[#f2f3f5] max-w-3/4">
          <div className="flex justify-between bg-[#4f47e6] rounded-sm p-1 min-w-[15rem]">
            <p className="text-white text-md font-semibold">
              {t("home.you")}
            </p>
            <p className="text-right text-sm text-white mt-1" dir={i18n.language == "ar" ? "rtl" : "ltr"}>
              {formatTime(message.date_created, i18n.language)}
            </p>
          </div>

          <p
            className="text-md mt-1 ml-2 whitespace-pre-line"
            dir={contentDisplay(message.message) ? "rtl" : "ltr"}
          >
            {convertLinksInsideMessages(message.message)}
          </p>
          {message.mediaFiles && (
            <Media urlFile={message.mediaFiles} />
          )}
        </div>
        {message.is_read === true ? (
          <p className="mt-auto text-md text-blue-500">
            <IoCheckmarkDoneSharp />
          </p>
        ) : (
          <p className="mt-auto text-md text-gray-500">
            <IoCheckmarkSharp />
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-2 ml-[25%]">
      {message.is_read === true ? (
        <p className="mt-auto text-md text-blue-500">
          <IoCheckmarkDoneSharp />
        </p>
      ) : (
        <p className="mt-auto text-md text-gray-500">
          <IoCheckmarkSharp />
        </p>
      )}
      <div className="rounded p-1 bg-[#E2F7CB]">
        <div className="flex justify-between bg-teal-400 rounded-sm p-1 min-w-[15rem]">
          <p className="text-white text-md font-semibold">
            {message.sender.first_name} {message.sender.last_name}
          </p>
          <p className="text-right text-sm text-white mt-1" dir={i18n.language == "ar" ? "rtl" : "ltr"}>
            {formatTime(message.date_created, i18n.language)}
          </p>
        </div>

        <p
          className="text-md mt-1 ml-2 whitespace-pre-line"
          dir={contentDisplay(message.message) ? "rtl" : "ltr"}
        >
          {convertLinksInsideMessages(message.message)}
        </p>
        {message.mediaFiles && (
          <Media urlFile={message.mediaFiles} />
        )}
      </div>
    </div>
  );
};

export default ServerMessageBubble;
