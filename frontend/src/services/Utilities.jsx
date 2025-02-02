// Helper function to check if text contains Arabic characters
export const contentDisplay = (string) => {
  const arabicRegex = [
    "ض",
    "ص",
    "ث",
    "ق",
    "ف",
    "غ",
    "إ",
    "ع",
    "ه",
    "خ",
    "ح",
    "ج",
    "د",
    "ذ",
    "ش",
    "س",
    "ي",
    "ب",
    "ل",
    "ا",
    "أ",
    "ت",
    "ن",
    "م",
    "ك",
    "ط",
    "ئ",
    "ء",
    "ؤ",
    "ر",
    "ى",
    "آ",
    "و",
    "ز",
    "ظ",
  ];
  return arabicRegex.some((alphabet) => string.includes(alphabet));
};

// Format timestamp based on how recent it is
export const formatTime = (dateString, language) => {
  const date = new Date(dateString);
  const now = new Date();

  const isSameDay = date.toDateString() === now.toDateString();
  const isSameWeek = (d1, d2) => {
    const oneJan = new Date(d2.getFullYear(), 0, 1);
    const weekNumber = (d, startOfWeekDay = 0) => {
      const dayOfYear = (d - oneJan + 86400000) / 86400000;
      return Math.ceil((dayOfYear - (d.getDay() + 1) + startOfWeekDay) / 7);
    };
    return (
      weekNumber(d1) === weekNumber(d2) && d1.getFullYear() === d2.getFullYear()
    );
  };
  const isSameMonth =
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const locale =
    language === "ar" ? "ar-DZ" : language === "fr" ? "fr-DZ" : "en-DZ";

  if (isSameDay) {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isSameWeek(date, now)) {
    return date.toLocaleDateString(locale, {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isSameMonth) {
    return date.toLocaleDateString(locale, {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

// Convert URLs in text to clickable links
export const convertLinksInsideMessages = (str) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return str.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <button
          key={index}
          onClick={() => window.open(part, "_blank")}
          className="hover:text-blue-500"
        >
          {part}
        </button>
      );
    }
    return part;
  });
};

// Truncate long strings
export const truncateString = (str) => {
  return str.length > 30 ? str.substring(0, 30) + "..." : str;
};

//
export const getFilesType = (files) => {
  return files.map((fileObj) => {
    const { file } = fileObj;
    const extension = file.split(".").pop()?.toLowerCase() ?? "";

    let type = "Other";

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)
    ) {
      type = "Image";
    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
      type = "Video";
    } else if (["mp3", "wav", "ogg", "m4a", "flac"].includes(extension)) {
      type = "Audio";
    }

    return { file, type };
  });
};

// Get the resolution of the client's screen
export const getClientResolutionClass = () => {
  const width = window.innerWidth;

  if (width < 1280) {
    return "phone";
  } else if (width >= 1280 && width < 1366) {
    return "desktop720";
  } else if (width >= 1366 && width < 1920) {
    return "desktop786";
  } else if (width >= 1920) {
    return "desktop1080";
  }
  return "unknown";
};

// Format phone number to be more readable
export const formatPhoneNumber = (num) => {
  if (!num || num.length !== 10) {
    return "Invalid phone number (must be a 10-digit number)";
  } else {
    return num
      .replace(/^(\d{2})/, "($1) ")
      .replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
};
