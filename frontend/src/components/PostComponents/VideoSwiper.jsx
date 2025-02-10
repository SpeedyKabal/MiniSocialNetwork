import { useRef, useEffect } from "react";
import Hls from "hls.js";
import "media-chrome";

const VideoSwiper = ({ videoFile, index, filesLength }) => {
  const videohls = useRef(null);

  useEffect(() => {
    const video = videohls.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoFile.file);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari (native HLS support)
      video.src = videoFile.file;
    }
  }, [videoFile.file]);

  return (
    <media-controller breakpointsm>
      <video
        slot="media"
        ref={videohls}
        preload="auto"
        crossOrigin=""
        className="mx-auto aspect-video"
      ></video>
      <div
        className="text-2xl bg-black/25 text-center w-full text-white"
        slot="top-chrome"
      >
        HSN {index + 1} / {filesLength}
      </div>
      <media-loading-indicator slot="centered-chrome"></media-loading-indicator>
      <media-control-bar>
        <media-play-button></media-play-button>
        <media-time-display showduration></media-time-display>
        <media-mute-button></media-mute-button>
        <media-volume-range></media-volume-range>
        <media-seek-backward-button seekoffset="10"></media-seek-backward-button>
        <media-time-range></media-time-range>
        <media-seek-forward-button seekoffset="10"></media-seek-forward-button>
        <media-playback-rate-button rates="0.5 1 2 3"></media-playback-rate-button>
        <media-fullscreen-button></media-fullscreen-button>
      </media-control-bar>
    </media-controller>
  );
};

export default VideoSwiper;
