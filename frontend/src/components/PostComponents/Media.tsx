import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getFilesType } from '../../services/Utilities'
import { Navigation, Pagination } from "swiper/modules";
import VideoSwiper from './VideoSwiper'
import FileReaderForMessages from "../FileReaderForMessages";

type FileExt = {
  file: string,
  type: "Image" | "Video" | "Audio" | "Other",
}

type MediaProps = {
  urlFile: { file: string }[],
}

const Media: React.FC<MediaProps> = ({ urlFile }) => {

  const [isLightboxOpen, setIsLightboxOpen] = useState<number>(-1);
  const [fileExtension, setFileExtension] = useState<FileExt[]>([]);

  useEffect(() => {
    if (urlFile && urlFile.length > 0) {
      const fileTypes = getFilesType(urlFile);
      setFileExtension(fileTypes);
    }
  }, [urlFile]);



  const imageFiles = fileExtension.filter((file) => file.type == "Image")
  const videoFiles = fileExtension.filter((file) => file.type == "Video")

  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="w-full max-w-[375px]  lg:max-w-[600px] max-h-[375px] mx-auto items-center"
      >
        {fileExtension.map((file, index) => (
          <SwiperSlide key={index}>
            {file.type == "Video" ? (
              <div className="flex justify-center items-center">
                <VideoSwiper videoFile={file} index={index} filesLength={videoFiles.length} />
              </div>
            ) : file.type == "Image" ? (
              <div className="w-full h-full flex justify-center items-center">
                <img
                  src={file.file}
                  alt="PostImage-0"
                  className="object-cover cursor-pointer rounded-lg"
                  onClick={() => setIsLightboxOpen(index)} // Open the lightbox starting from the clicked image
                />
              </div>

            ) : file.type == "Audio" ? (
              <div className="flex w-full h-full">
                <audio controls className="w-full">
                  <source src={file.file} />
                  Your browser does not support the audio element.
                </audio>
              </div>

            ) : (
              <FileReaderForMessages fileLink={file.file} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      {isLightboxOpen !== -1 && (
        <Lightbox
          open={isLightboxOpen !== -1}
          close={() => setIsLightboxOpen(-1)}
          slides={imageFiles.map((ele) => ({ src: ele.file }))}
          plugins={[Fullscreen, Zoom]}
          index={isLightboxOpen} // Start from the clicked image
          zoom={{
            maxZoomPixelRatio: 10,
            zoomInMultiplier: 1,
            doubleTapDelay: 500,
            doubleClickDelay: 500,
            doubleClickMaxStops: 5,
            wheelZoomDistanceFactor: 50,
            pinchZoomDistanceFactor: 50,
            scrollToZoom: true,
          }}
        />
      )}
    </div>
  );
};

export default Media