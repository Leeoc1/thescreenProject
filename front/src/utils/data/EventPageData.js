import event1 from "../../images/event1.png";
import event2 from "../../images/event2.png";
import event3 from "../../images/event3.png";
import event4 from "../../images/event4.jpg";
import event5 from "../../images/event5.jpg";
import event6 from "../../images/event6.jpg";

// ========== 이벤트 페이지 데이터 ==========
// 이미지들은 src/images 폴더에서 import로 참조
export const eventsData = [
  {
    title: "신작 영화 VIP 시사회",
    description:
      "최신 블록버스터 영화를 개봉 전에 먼저 감상할 수 있는 특별한 기회입니다. VIP 혜택과 함께 안락한 특별석 기회를 놓치지 마세요.",
    location: "강남점",
    badgeColor: "bg-cinemax-yellow text-black",
    image: event1, // VIP 시사회 이벤트 이미지
    period: "2025.07.01 ~ 2025.09.30",
  },
  {
    title: "멤버십 가입 혜택",
    description:
      "멤버십 가입하고 매월 특별한 할인과 무료 영화 관람권을 받아보세요. 적립, 할인, 추가 혜택까지 모두 누리세요.",
    location: "전국 지점",
    badgeColor: "bg-green-600 text-white",
    image: event2, // 멤버십 혜택 이벤트 이미지
    period: "2025.07.01 ~ 2025.09.30",
  },
  {
    title: "크리스마스 영화 페스티벌",
    description:
      "온 가족이 함께 즐길 수 있는 크리스마스 특별 상영작과 낭만적인 로맨스 영화들을 특별 할인가로 만나보세요.",
    location: "여의도점",
    badgeColor: "bg-cinemax-yellow text-black",
    image: event3, // 크리스마스 페스티벌 이벤트 이미지
    period: "2025.07.01 ~ 2025.09.30",
  },
  {
    title: "학생 할인 혜택",
    description:
      "학생증만 제시하면 모든 영화 30% 할인! 가성비 좋은 영화 관람의 기회를 놓치지 마세요.",
    location: "전국 지점",
    badgeColor: "bg-blue-600 text-white",
    image: event4, // 학생 할인 - 영화 관련 이미지
    period: "2025.07.01 ~ 2025.09.30",
  },

  // 가데이터 1
  {
    title: "여름방학 특별 영화제",
    description:
      "여름방학을 맞아 가족과 친구들이 함께 즐길 수 있는 특별 영화제를 준비했습니다. 다양한 장르의 인기 영화를 할인된 가격에 만나보세요.",
    location: "부산점",
    badgeColor: "bg-cinemax-yellow text-black",
    image: event5, // 여름방학 영화제 - 영화관 스크린
    period: "2025.07.15 ~ 2025.09.30",
  },

  // 가데이터 2
  {
    title: "9월 영화 할인 대축제",
    description:
      "9월 한 달간 모든 영화 예매 시 30% 할인! 다양한 이벤트와 경품도 함께 진행됩니다.",
    location: "전국 지점",
    badgeColor: "bg-green-600 text-white",
    image: event6, // 9월 할인 대축제 - 영화관 스크린
    period: "2025.09.01 ~ 2025.09.30",
  },

  // 종료된 이벤트 가데이터
  {
    title: "봄맞이 로맨스 영화 페스티벌",
    description:
      "벚꽃이 피는 계절에 어울리는 감동적인 로맨스 영화들을 특별가로 만나보는 이벤트였습니다. 커플 할인 혜택도 함께 제공되었습니다.",
    location: "강남점",
    badgeColor: "end",
    image: event1,
    period: "2025.03.01 ~ 2025.04.30",
    category: "종료된 이벤트",
    badge: "end",
  },
  {
    title: "어린이날 가족 영화관",
    description:
      "온 가족이 함께 즐길 수 있는 애니메이션과 가족 영화를 할인된 가격으로 관람할 수 있었던 특별한 어린이날 이벤트였습니다.",
    location: "부산점",
    badgeColor: "end",
    image: event2,
    period: "2025.05.01 ~ 2025.05.31",
    category: "종료된 이벤트",
    badge: "end",
  },
  {
    title: "여름 블록버스터 미리보기",
    description:
      "여름 시즌 대작 영화들을 개봉 전에 미리 감상할 수 있었던 VIP 전용 미리보기 이벤트였습니다. 감독과의 대화 시간도 포함되었습니다.",
    location: "홍대점",
    badgeColor: "end",
    image: event3,
    period: "2025.06.01 ~ 2025.06.30",
    category: "종료된 이벤트",
    badge: "end",
  },
  {
    title: "신학기 학생 특가 이벤트",
    description:
      "새 학기를 맞은 학생들을 위한 특별 할인 이벤트였습니다. 학생증 제시 시 모든 영화 50% 할인 혜택이 제공되었습니다.",
    location: "전국 지점",
    badgeColor: "end",
    image: event4,
    period: "2025.02.15 ~ 2025.03.15",
    category: "종료된 이벤트",
    badge: "end",
  },

  // 멤버쉽 이벤트 가데이터
  {
    title: "골드 멤버십 VIP 혜택",
    description:
      "골드 멤버십 가입 시 매월 무료 영화 관람권 2매와 함께 팝콘, 음료 무료 쿠폰을 제공합니다. 전용 라운지 이용 가능합니다.",
    location: "전국 지점",
    badgeColor: "membership",
    image: event5,
    period: "상시 진행",
    category: "멤버쉽",
    badge: "membership",
  },
  {
    title: "플래티넘 멤버십 특별 혜택",
    description:
      "최상위 멤버십으로 무제한 영화 관람, 프리미엄 좌석 우선 예약, 신작 영화 사전 관람 등 최고급 혜택을 누려보세요.",
    location: "전국 지점",
    badgeColor: "membership",
    image: event6,
    period: "상시 진행",
    category: "멤버쉽",
    badge: "membership",
  },
  {
    title: "패밀리 멤버십 할인 혜택",
    description:
      "가족 단위 멤버십으로 최대 4인까지 할인 혜택을 받을 수 있습니다. 어린이 영화 무료 관람과 가족 이벤트 우선 참여 기회를 제공합니다.",
    location: "전국 지점",
    badgeColor: "membership",
    image: event1,
    period: "상시 진행",
    category: "멤버쉽",
    badge: "membership",
  },
  {
    title: "영 멤버십 청년 할인",
    description:
      "만 19-29세 청년들을 위한 특별 멤버십입니다. 모든 영화 40% 할인과 청년 전용 이벤트, 스낵바 할인 혜택을 받아보세요.",
    location: "전국 지점",
    badgeColor: "membership",
    image: event2,
    period: "상시 진행",
    category: "멤버쉽",
    badge: "membership",
  },
];

