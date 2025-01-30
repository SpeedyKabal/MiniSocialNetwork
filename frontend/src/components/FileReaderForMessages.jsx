import React from "react";
import {
  FaFileWord,
  FaFilePdf,
  FaFileZipper,
  FaFileCircleQuestion,
} from "react-icons/fa6";
import { FaFileExcel, FaFilePowerpoint } from "react-icons/fa";

function FileReaderForMessages({ fileLink }) {
  const getFileExtension = fileLink.split(".").pop().toLowerCase();

  const renderFile = () => {
    // MSWord File
    if (["doc", "docx"].includes(getFileExtension)) {
      return (
        <a
          href={fileLink}
          className=" text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFileWord />
        </a>
      );
    } // MSExcel File
    else if (["xls", "xlsx"].includes(getFileExtension)) {
      return (
        <a
          href={fileLink}
          className="text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFileExcel />
        </a>
      );
    } // MSPowerPoint File
    else if (["ppt", "pptx"].includes(getFileExtension)) {
      return (
        <a
          href={fileLink}
          className="text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFilePowerpoint />
        </a>
      );
    } // PDF File
    else if (["pdf"].includes(getFileExtension)) {
      return (
        <a
          href={fileLink}
          target="_blank"
          className="text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFilePdf />
        </a>
      );
    } // Archive File
    else if (["zip", "rar"].includes(getFileExtension)) {
      return (
        <a
          href={fileLink}
          className="text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFileZipper />
        </a>
      );
    } // Other Files
    else {
      return (
        <a
          href={fileLink}
          className="text-[8rem] text-blue-400 hover:text-blue-800"
        >
          <FaFileCircleQuestion />
        </a>
      );
    }
  };
  return (
    <div className="flex justify-center my-2 messageContainer">
      {renderFile()}
    </div>
  );
}

export default FileReaderForMessages;
