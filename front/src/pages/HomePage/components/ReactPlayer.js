import React from "react";

const TrailerPlayer = () => (
  <div style={{ width: "100%", height: "100%", position: "relative" }}>
    <iframe
      width="100%"
      height="100%"
      src="https://www.youtube.com/embed/xUDhdCsLkjU?autoplay=1&mute=1&loop=1&playlist=xUDhdCsLkjU&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3&disablekb=1&playsinline=1&vq=hd1080"
      title="Movie Trailer"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{
        border: "none",
        width: "100%",
        height: "100%",
        pointerEvents: "none", // 마우스 상호작용 완전 차단
      }}
    />
    {/* 투명한 오버레이로 클릭 차단 */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        zIndex: 1,
        pointerEvents: "auto",
      }}
    />
  </div>
);

export default TrailerPlayer;

