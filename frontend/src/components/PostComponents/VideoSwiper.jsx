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
      {/* Centered play button */}
      <media-play-button slot="centered-chrome"></media-play-button>
      
      {/* Top control bar */}
      <media-control-bar slot="top-chrome">
        <media-time-display showduration></media-time-display>
        <media-mute-button></media-mute-button>
        <media-volume-range></media-volume-range>
        <media-playback-rate-button rates="0.5 1 1.5 2"></media-playback-rate-button>
        <media-fullscreen-button></media-fullscreen-button>
      </media-control-bar>
      {/* Bottom control bar */}
      <media-control-bar>
        <media-seek-backward-button seekoffset="15"></media-seek-backward-button>
        <media-time-range></media-time-range>
        <media-seek-forward-button seekoffset="15"></media-seek-forward-button>
      </media-control-bar>
    </media-controller>
  );
};

export default VideoSwiper;
