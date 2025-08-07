import { useState, useEffect } from "react";
import { getReservation } from "../../../../api/reservationApi";
import { getStaffs } from "../../../../api/userApi";
import { getAllUsers } from "../../../../api/userApi";

export const useSalesData = () => {
  const [totalVolume, setTotalVolume] = useState(0);
  const [increaseVolume, setIncreaseVolume] = useState(0);
  const [todayReservationCount, setTodayReservationCount] = useState(0);
  const [increaseReservationCount, setIncreaseReservationCount] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [increaseAveragePrice, setIncreaseAveragePrice] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [increaseStaffCount, setIncreaseStaffCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [increaseUserCount, setIncreaseUserCount] = useState(0);

  // 한국 시간대 기준으로 날짜 계산
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC + 9시간
  const today = koreaTime.toISOString().split("T")[0];
  const yesterdayTime = new Date(koreaTime.getTime() - 24 * 60 * 60 * 1000);
  const yesterday = yesterdayTime.toISOString().split("T")[0];

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservationView = await getReservation();

        // 날짜 비교 로직 - reservationtime이 LocalDateTime 형태이므로 날짜 부분만 추출
        const todayReservation = reservationView.filter((reservation) => {
          if (!reservation.reservationtime) return false;
          const reservationDate = reservation.reservationtime.split("T")[0];
          return reservationDate === today;
        });

        const yesterdayReservation = reservationView.filter((reservation) => {
          if (!reservation.reservationtime) return false;
          const reservationDate = reservation.reservationtime.split("T")[0];
          return reservationDate === yesterday;
        });

        //매출 계산
        const todayTotalVolume = todayReservation.reduce(
          (sum, item) => sum + (item.amount ?? 0),
          0
        );
        const yesterdayTotalVolume = yesterdayReservation.reduce(
          (sum, item) => sum + (item.amount ?? 0),
          0
        );

        // 0으로 나누기 방지
        const increaseVolume =
          yesterdayTotalVolume > 0
            ? (
                ((todayTotalVolume - yesterdayTotalVolume) /
                  yesterdayTotalVolume) *
                100
              ).toFixed(2)
            : todayTotalVolume > 0
            ? "100.00"
            : "0.00";

        //예매 건수 계산
        const todayReservationCount = todayReservation.length;
        const yesterdayReservationCount = yesterdayReservation.length;
        const increaseReservationCount =
          yesterdayReservationCount > 0
            ? (
                ((todayReservationCount - yesterdayReservationCount) /
                  yesterdayReservationCount) *
                100
              ).toFixed(2)
            : todayReservationCount > 0
            ? "100.00"
            : "0.00";

        //평균 객단가 계산
        const averagePrice =
          todayReservationCount > 0
            ? todayTotalVolume / todayReservationCount
            : 0;
        const yesterdayAveragePrice =
          yesterdayReservationCount > 0
            ? yesterdayTotalVolume / yesterdayReservationCount
            : 0;

        const increaseAveragePrice =
          yesterdayAveragePrice > 0
            ? (
                ((averagePrice - yesterdayAveragePrice) /
                  yesterdayAveragePrice) *
                100
              ).toFixed(2)
            : averagePrice > 0
            ? "100.00"
            : "0.00";

        //직원 수 계산 - 전체 직원 수
        const staffCount = await getStaffs();
        const todayStaffCount = staffCount.length; // 전체 직원 수

        // 어제까지 가입한 직원 수 계산
        const yesterdayStaff = staffCount.filter((staff) => {
          if (staff.hiredate) {
            const staffDate = new Date(staff.hiredate);
            const staffDateStr = staffDate.toISOString().split("T")[0];
            return staffDateStr <= yesterday; // 어제까지 가입한 직원
          }
          return false;
        });
        const yesterdayStaffCount = yesterdayStaff.length;

        // 직원 수 차이값 (오늘 - 어제)
        const staffCountDifference = todayStaffCount - yesterdayStaffCount;

        //유저 수 계산 - 전체 사용자 수
        const userCount = await getAllUsers();
        const todayUserCount = userCount.length; // 전체 사용자 수

        // 어제까지 가입한 유저 수 계산
        const yesterdayUsers = userCount.filter((user) => {
          if (user.reg_date) {
            const userDate = new Date(user.reg_date);
            const userDateStr = userDate.toISOString().split("T")[0];
            return userDateStr <= yesterday; // 어제까지 가입한 유저
          }
          return false;
        });
        const yesterdayUserCount = yesterdayUsers.length;

        // 유저 수 차이값 (오늘 - 어제)
        const userCountDifference = todayUserCount - yesterdayUserCount;

        setTotalVolume(todayTotalVolume);
        setIncreaseVolume(increaseVolume);
        setTodayReservationCount(todayReservationCount);
        setIncreaseReservationCount(increaseReservationCount);
        setAveragePrice(averagePrice);
        setIncreaseAveragePrice(increaseAveragePrice);
        setStaffCount(todayStaffCount);
        setIncreaseStaffCount(staffCountDifference);
        setUserCount(todayUserCount);
        setIncreaseUserCount(userCountDifference);
      } catch (error) {
        // 에러 처리
      }
    };

    fetchReservation();
  }, [today]);

  return {
    totalVolume,
    increaseVolume,
    todayReservationCount,
    increaseReservationCount,
    averagePrice,
    increaseAveragePrice,
    staffCount,
    increaseStaffCount,
    userCount,
    increaseUserCount,
  };
};
