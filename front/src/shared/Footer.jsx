import "./Footer.css";
import youtubeIcon from "../images/youtube-icon.svg";
import instagramIcon from "../images/instagram-icon.svg";
import facebookIcon from "../images/facebook-icon.svg";
import twitterIcon from "../images/twitter-icon.svg";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Top Navigation Links */}
        <div className="footer-nav">
          <a href="#" className="footer-nav-link">
            회사소개
          </a>
          <a href="#" className="footer-nav-link">
            인재채용
          </a>
          <a href="#" className="footer-nav-link">
            사회공헌
          </a>
          <a href="#" className="footer-nav-link">
            제휴/광고/부대사업문의
          </a>
          <a href="#" className="footer-nav-link">
            이용약관
          </a>
          <a href="#" className="footer-nav-link strong">
            위치정보서비스 이용약관
          </a>
          <a href="#" className="footer-nav-link strong">
            개인정보처리방침
          </a>
          <a href="#" className="footer-nav-link">
            윤리경영
          </a>
        </div>

        {/* Company Info */}
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <div className="megabox-logo">
                <span className="mega-text">The</span>
                <span className="box-text"> Screen</span>
              </div>
              <span className="company-text">CINEMA WEB SERVICE</span>
            </div>

            <div className="company-info">
              <p>
                서울특별시 강남구 도산대로 n길 22 연세빌딩 건물 n층 n호 ARS
                1544-**** 대표이메일 example@google.com
              </p>
              <p>
                대표자명 홍길동, 임꺽정 · 개인정보보호책임자 보안책임자 ·
                사업자등록번호 2**-86-59*** · 통신판매업신고번호
                2***-서울강남-0****
              </p>
              <p>COPYRIGHT © TheScreenProject, Inc. All rights reserved</p>
            </div>
          </div>

          <div className="footer-right">
            <div className="social-icons">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img src={youtubeIcon} alt="YouTube" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img src={instagramIcon} alt="Instagram" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img src={twitterIcon} alt="Twitter" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

