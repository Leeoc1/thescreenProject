import React from "react";
import * as XLSX from "xlsx";
import "./ExcelDownloadButton.css";

/**
 * ExcelDownloadButton
 * @param {Object[]} data - 엑셀로 내보낼 데이터 배열 (JSON)
 * @param {Object} columns - {엑셀헤더: 데이터키} 형태의 매핑 객체
 * @param {string} fileName - 저장할 파일명 (확장자 제외)
 * @param {string} [sheetName] - 시트명 (기본값: "Sheet1")
 * @param {string} [buttonText] - 버튼에 표시할 텍스트 (기본값: "엑셀 다운로드")
 */
const ExcelDownloadButton = ({
  data,
  columns,
  fileName,
  sheetName = "Sheet1",
  buttonText = "엑셀 다운로드",
}) => {
  const handleDownload = () => {
    if (!data || data.length === 0) return;
    // columns 매핑에 따라 데이터 변환
    const exportData = data.map((row) => {
      const obj = {};
      Object.entries(columns).forEach(([header, key]) => {
        obj[header] = row[key];
      });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 1. 열 너비 자동 조정
    const headers = Object.keys(columns);
    const colWidths = headers.map((header) => {
      const maxLen = Math.max(
        header.length,
        ...exportData.map((row) =>
          row[header] ? String(row[header]).length : 0
        )
      );
      return { wch: maxLen + 2 };
    });
    worksheet["!cols"] = colWidths;

    // (셀 스타일 적용은 sheetjs 무료버전에서 지원되지 않으므로 생략)

    // 스타일 적용을 위해 bookType: 'xlsx', cellStyles: true 옵션 필요
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`, {
      bookType: "xlsx",
      cellStyles: true,
    });
  };
  return (
    <button className="excel-download-btn" onClick={handleDownload}>
      {buttonText}
    </button>
  );
};

export default ExcelDownloadButton;

