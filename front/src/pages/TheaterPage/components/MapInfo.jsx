import React, { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  MapTypeControl,
  ZoomControl,
} from "react-kakao-maps-sdk";
import mygpsIcon from "../../../images/mygps.png";
import "../styles/MapInfo.css";

const MapInfo = ({ cinemanm, tel, address, myState, theaterState }) => {
  // 내가 보고 있는 지도 위치 (보여주는 용도, 마커 안 찍음)
  // 기본값: 서울 시청
  const [state, setState] = useState({
    center:
      theaterState.center.lat === 0 && theaterState.center.lng === 0
        ? { lat: 37.5665, lng: 126.978 }
        : { lat: theaterState.center.lat, lng: theaterState.center.lng },
  });

  // 지도 키면 오버레이 확장 되어 있음
  const [isOpen, setIsOpen] = useState(true);

  // 내 위치 버튼 클릭 시 지도 중심 이동
  const handleMyState = () => {
    setState({
      center: { lat: myState.center.lat, lng: myState.center.lng },
    });
  };

  // 영화관 좌표가 바뀌면 지도 중심도 갱신
  useEffect(() => {
    if (
      theaterState.center.lat !== 0 &&
      theaterState.center.lng !== 0 &&
      !theaterState.isLoading
    ) {
      setState({
        center: { lat: theaterState.center.lat, lng: theaterState.center.lng },
      });
    }
  }, [
    theaterState.center.lat,
    theaterState.center.lng,
    theaterState.isLoading,
  ]);

  return (
    <div className="mpi-map-wrap">
      <Map
        center={state.center}
        style={{ width: "100%", height: "500px" }}
        level={5}
        onCenterChanged={(m) => {
          setState({
            center: {
              lat: m.getCenter().getLat(),
              lng: m.getCenter().getLng(),
            },
          });
        }}
        isPanto={true}
      >
        <MapTypeControl position={"TOPRIGHT"} />
        <ZoomControl position={"RIGHT"} />
        {!myState.isLoading &&
          myState.center.lat !== 0 &&
          myState.center.lng !== 0 && <MapMarker position={myState.center} />}
        {!theaterState.isLoading &&
          theaterState.center.lat !== 0 &&
          theaterState.center.lng !== 0 && (
            <MapMarker
              position={theaterState.center}
              onClick={() => setIsOpen(true)}
            />
          )}
        {isOpen &&
          !theaterState.isLoading &&
          theaterState.center.lat !== 0 &&
          theaterState.center.lng !== 0 && (
            <CustomOverlayMap position={theaterState.center}>
              <div className="mpi-wrap">
                <div className="mpi-info">
                  <div className="mpi-title">
                    {cinemanm}
                    <div
                      className="mpi-close"
                      onClick={() => setIsOpen(false)}
                      title="닫기"
                    ></div>
                  </div>
                  <div className="mpi-body">
                    <div className="mpi-desc">
                      <div className="mpi-ellipsis">{address}</div>
                      <div className="mpi-jibun mpi-ellipsis">{tel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CustomOverlayMap>
          )}
      </Map>
      <div
        className="mpi-mystate-button"
        onClick={() => {
          handleMyState();
        }}
      >
        <img src={mygpsIcon} alt="mygps" />
      </div>
    </div>
  );
};

export default MapInfo;

