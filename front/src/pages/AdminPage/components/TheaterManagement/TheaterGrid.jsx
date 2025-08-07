import React from "react";
import TheaterCard from "./TheaterCard";
import TheaterDetail from "./TheaterDetail";

const CARDS_PER_ROW = 3;

const TheaterGrid = ({
  cinemas,
  openDetailIdx,
  setOpenDetailIdx,
  screenList,
  onStatusClick,
  getStatusClass,
  onEdit,
  onDelete,
}) => {
  // 카드 3개씩 한 줄로 묶기
  const rows = [];
  for (let i = 0; i < cinemas.length; i += CARDS_PER_ROW) {
    rows.push(cinemas.slice(i, i + CARDS_PER_ROW));
  }

  const handleDetailClick = (rowIdx, idx) => {
    const cardIndex = rowIdx * CARDS_PER_ROW + idx;
    setOpenDetailIdx(openDetailIdx === cardIndex ? null : cardIndex);
  };

  return (
    <div className="thm-theater-grid-wrapper">
      <div className="thm-theater-grid">
        {rows.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((theater, idx) => (
              <TheaterCard
                key={theater.cinemacd}
                theater={theater}
                onDetailClick={() => handleDetailClick(rowIdx, idx)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {/* 드롭다운 상세: 해당 줄에서 상세보기 열린 카드 아래에만 표시 */}
            {openDetailIdx !== null &&
              openDetailIdx >= rowIdx * CARDS_PER_ROW &&
              openDetailIdx < (rowIdx + 1) * CARDS_PER_ROW && (
                <TheaterDetail
                  cinema={cinemas[openDetailIdx]}
                  screenList={screenList}
                  onStatusClick={onStatusClick}
                  getStatusClass={getStatusClass}
                />
              )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TheaterGrid;

