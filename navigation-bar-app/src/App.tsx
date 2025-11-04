// NavigationBar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import springAxiosInst from "./utility/AxiosInst.ts";
import {logoutRequest, tokenVerification} from "./utility/AccountApi.ts";

// 로고 이미지
import logoBlack from "./assets/jobspoonLOGO_black.png";

// 모바일 메뉴 오버레이
const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

// 모바일 메뉴
const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: calc(100vh - 72px);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: 24px 0;
`;

// 모바일 네비게이션 링크
const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  text-decoration: none;
  color: ${({ $active }) => ($active ? "#1a1a1a" : "#666666")};
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  padding: 16px 24px;
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)"
      : "transparent"};
  transition: all 0.2s ease;
  border-left: 3px solid ${({ $active }) => ($active ? "#4F9CF9" : "transparent")};
  
  &:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.04);
  }
`;

// 모바일 인증 버튼
const MobileAuthButton = styled.button`
  width: calc(100% - 48px);
  margin: 16px 24px;
  appearance: none;
  border: 0;
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 14px 24px;
  border-radius: 12px;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
`;

// 햄버거 메뉴 버튼
const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
`;

const HamburgerLine = styled.span<{ $isOpen: boolean }>`
  width: 24px;
  height: 2px;
  background: #1a1a1a;
  transition: all 0.3s ease;
  border-radius: 2px;
  
  &:nth-child(1) {
    transform: ${({ $isOpen }) =>
      $isOpen ? "rotate(45deg) translateY(7px)" : "none"};
  }
  
  &:nth-child(2) {
    opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
  }
  
  &:nth-child(3) {
    transform: ${({ $isOpen }) =>
      $isOpen ? "rotate(-45deg) translateY(-7px)" : "none"};
  }
`;

const Header = styled.header<{ $scrolled?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: 72px;
  background: ${({ $scrolled }) => 
    $scrolled 
      ? "rgba(255, 255, 255, 0.95)" 
      : "rgba(255, 255, 255, 0.7)"
  };
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #1a1a1a;
  border-bottom: ${({ $scrolled }) => 
    $scrolled 
      ? "1px solid rgba(0, 0, 0, 0.08)" 
      : "1px solid transparent"
  };
  box-shadow: ${({ $scrolled }) => 
    $scrolled 
      ? "0 2px 16px rgba(0, 0, 0, 0.04)" 
      : "none"
  };
  transition: all 0.3s ease;
`;

const Inner = styled.div`
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 1024px) {
    padding: 0 24px;
  }
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #1a1a1a;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImg = styled.img`
  width: clamp(70px, 6.458333vw, 100px);
  height: clamp(40px, 3.680556vw, 57px);
  object-fit: contain;
  display: block;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 1024px) {
    gap: 4px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link) <{ $active?: boolean }>`
  text-decoration: none;
  color: ${({ $active }) => ($active ? "#1a1a1a" : "#666666")};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  padding: 10px 18px;
  border-radius: 12px;
  background: ${({ $active }) => 
    $active 
      ? "linear-gradient(135deg, rgba(79, 156, 249, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)" 
      : "transparent"
  };
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  white-space: nowrap;
  
  &:hover {
    color: #1a1a1a;
    background: ${({ $active }) => 
      $active 
        ? "linear-gradient(135deg, rgba(79, 156, 249, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)" 
        : "rgba(0, 0, 0, 0.04)"
    };
    transform: translateY(-1px);
  }
  
  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const AuthButton = styled.button`
  appearance: none;
  border: 0;
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 24px;
  border-radius: 50px;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(79, 156, 249, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 156, 249, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px 18px;
  }
`;

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {

    if(isLoggedIn){
      setIsLoggedIn(true);
    }

    const checkLogin = async () => {
      try {
        const result = await tokenVerificationRequest(); // await 필수

        console.log(result);

        if (result.status === false) {
          // result가 false일 때 처리
          console.log("로그인 인증 실패");
          localStorage.removeItem("nickname");
          localStorage.removeItem("isLoggedIn");

        } else if (result.status === true) {
          localStorage.setItem("nickname", result.nickname);
          localStorage.setItem("isLoggedIn", "dsds-ww-sdx-s>W??");
          setIsLoggedIn(true);
        }


        const token = localStorage.getItem("isLoggedIn");
        setIsLoggedIn(!!token); // 값이 있으면 true, 없으면 false
      } catch (err: any) {
        if (err.response) {
          if(err.response.status === 429) {
            setIsLoggedIn(true);
          }
          else{
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("nickname");
            setIsLoggedIn(false);}
        }

      }
    };

    checkLogin();
  }, [location]);

  const tokenVerificationRequest = async () => {

    const axiosResponse = await tokenVerification();
    return axiosResponse.data;


  }

  const handleLogout = async () => {
    try {
      const axiosResponse = await logoutRequest();
      if (axiosResponse.status === 200 ) {
        setIsLoggedIn(false);
        localStorage.removeItem("nickname");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
      } else {
        alert("로그아웃에 실패 하였습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("로그아웃중 문제 발생");
    }
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileLogout = async () => {
    await handleLogout();
    closeMobileMenu();
  };

  // 모바일 메뉴가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  return (
    <>
      <Header $scrolled={isScrolled}>
        <Inner>
          <Brand to="/" aria-label="JobSpoon 홈">
            <LogoImg src={logoBlack} alt="JobSpoon" />
          </Brand>

          <Nav>
            <NavLink to="/vue-ai-interview/ai-interview/landing" $active={isActive("/vue-ai-interview")}>
              AI 인터뷰
            </NavLink>
            <NavLink to="/spoon-word" $active={isActive("/spoon-word")}>스푼워드</NavLink>
            <NavLink to="/mypage" $active={isActive("/mypage")}>MyPage</NavLink>
            {!isLoggedIn ? (
              <NavLink to="/vue-account/account/login" $active={isActive("/vue-account")}>
                로그인
              </NavLink>
            ) : (
              <AuthButton onClick={handleLogout}>로그아웃</AuthButton>
            )}
          </Nav>

          <HamburgerButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="메뉴">
            <HamburgerLine $isOpen={isMobileMenuOpen} />
            <HamburgerLine $isOpen={isMobileMenuOpen} />
            <HamburgerLine $isOpen={isMobileMenuOpen} />
          </HamburgerButton>
        </Inner>
      </Header>

      <MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
      <MobileMenu $isOpen={isMobileMenuOpen}>

        <MobileNavLink to="/vue-ai-interview/ai-interview/landing" $active={isActive("/vue-ai-interview")}>
          AI 인터뷰
        </MobileNavLink>

        <MobileNavLink to="/spoon-word" $active={isActive("/spoon-word")}>
          스푼워드
        </MobileNavLink>
        <MobileNavLink to="/mypage" $active={isActive("/mypage")}>
          MyPage
        </MobileNavLink>
        {!isLoggedIn ? (
          <MobileNavLink to="/vue-account/account/login" $active={isActive("/vue-account")}>
            로그인
          </MobileNavLink>
        ) : (
          <MobileAuthButton onClick={handleMobileLogout}>로그아웃</MobileAuthButton>
        )}
      </MobileMenu>
    </>
  );
};

export default App;
