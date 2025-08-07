import React from "react";
import ScreenItem from "./ScreenItem";

const ScreenList = ({ screenList, onStatusClick, getStatusClass }) => {
  return (
    <div className="thm-theater-detail-screenscroll">
      <ul>
        {screenList.length === 0 ? (
          <li>상영관 정보가 없습니다.</li>
        ) : (
          screenList.map((screen, i) => (
            <ScreenItem
              key={i}
              screen={screen}
              onStatusClick={onStatusClick}
              getStatusClass={getStatusClass}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default ScreenList;

