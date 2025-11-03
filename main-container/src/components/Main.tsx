// src/components/Main.tsx
import React, { useEffect, useState, useRef, useId } from "react";
import styled, { keyframes } from "styled-components";
import image from "../assets/nugule.png";
import confetti from "canvas-confetti";

/* ====== 로고 이미지 ====== */
import logoDanggeun from "../assets/d1.png";
import logoToss from "../assets/t2.png";
import logoEncore from "../assets/e1.png";
import logoKT from "../assets/3.png";

/* ========== 공통 레이아웃 ========== */
const Page = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 0px;
  background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 40%, #e0f2fe 100%);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 16px 0px;
  }
  
  :root[data-theme="dark"] & {
    background: linear-gradient(180deg, #1e293b 0%, #0f1f3a 40%, #0c2340 100%);
  }
`;

const BackgroundTextContainer = styled.div`
  position: fixed;
  top: 65%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const BackgroundText = styled.div<{ $isVisible: boolean }>`
  display: flex;
  white-space: nowrap;
  font-size: clamp(70px, 10vw, 120px);
  font-weight: 900;
  color: rgba(200, 230, 255, 0.35);
  letter-spacing: 0.1em;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
  animation: scrollLeft 30s linear infinite;
  
  @media (max-width: 640px) {
    font-size: 60px;
    opacity: ${props => props.$isVisible ? 0.5 : 0};
  }
  
  :root[data-theme="dark"] & {
    color: rgba(30, 60, 100, 0.4);
  }

  @keyframes scrollLeft {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

/* ====== 히어로 섹션 ====== */
const HeroSection = styled.section`
  max-width: 900px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  margin-top: 35px;
  margin-bottom: 100px;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin-top: 20px;
    margin-bottom: 60px;
    padding: 0 16px;
  }
`;

const MainTitle = styled.h1`
  font-size: clamp(36px, 7vw, 50px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.25;
  margin-bottom: 28px;
  word-break: keep-all;
  color: #0f172a;
  
  @media (max-width: 640px) {
    font-size: clamp(28px, 8vw, 36px);
    line-height: 1.3;
    margin-bottom: 20px;
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  text-decoration-thickness: 4px;
  text-underline-offset: 6px;
`;

const Subtitle = styled.p`
  font-size: clamp(16px, 2.5vw, 19px);
  font-weight: 500;
  line-height: 1.8;
  color: #334155;
  margin-bottom: 48px;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 32px;
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }
  
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
    width: 100%;
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  //background-color: #21A3AE ;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: 100%;
    max-width: 100%;
    padding: 16px 32px;
    font-size: 16px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  }
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  :root[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.05);
    color: #60a5fa;
    border-color: rgba(96, 165, 250, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(96, 165, 250, 0.5);
    }
  }

  @media (max-width: 640px) {
    width: 100%;
    max-width: 400px;
    padding: 14px 28px;
    font-size: 15px;
  }
`;

const BlueButton = styled(SecondaryButton)`
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;

  &:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  :root[data-theme="dark"] & {
    background: #3b82f6;
    color: #ffffff;
    border-color: #3b82f6;
    
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
  }

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;
    bottom: 24px;
    right: 24px;
    font-size: 22px;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
`;

const ScrollTopButton = styled(FloatingButton)`
  bottom: 100px;
  background: white;
  color: #3b82f6;
  border: 2px solid #e2e8f0;
  font-size: 20px;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  @media (max-width: 768px) {
    bottom: 88px;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }
`;

/* ====== 서비스 카드 섹션 ====== */
const ServiceSection = styled.section`
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
  margin-top: 300px;
  padding: 0 20px 300px;
  
  @media (max-width: 768px) {
    margin-top: 150px;
    padding: 0 20px 150px;
  }
  
  @media (max-width: 640px) {
    padding: 0 16px 120px;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 400px;
    background: linear-gradient(to bottom, transparent 0%, rgba(191, 219, 254, 0.3) 50%, rgba(191, 219, 254, 0.6) 100%);
    pointer-events: none;
    z-index: -1;
  }
  
  :root[data-theme="dark"] &::after {
    background: linear-gradient(to bottom, transparent 0%, rgba(30, 58, 138, 0.2) 50%, rgba(30, 58, 138, 0.4) 100%);
  }
`;

const ServiceTitle = styled.h2`
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  text-align: center;
  margin-bottom: 16px;
  color: #1a1a1a;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 26px;
    line-height: 1.4;
    padding: 0 16px;
  }
  
  :root[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const ServiceSubtitle = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  font-weight: 500;
  text-align: center;
  color: #5a5a5a;
  margin-bottom: 48px;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 14px;
    margin-bottom: 32px;
  }
  
  :root[data-theme="dark"] & {
    color: #94a3b8;
  }
`;

const ServiceGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: -20px;
  margin-bottom: 40px;
  perspective: 1000px;
  min-height: 400px;

  @media (max-width: 1200px) {
    gap: 10px;
  }

  @media (max-width: 1024px) {
    flex-wrap: wrap;
    gap: 20px;
    min-height: auto;
  }

  @media (max-width: 640px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 20px;
    padding: 0 12px;
  }
`;

const ServiceCard = styled.div<{ $rotation: number; $zIndex: number; $isVisible?: boolean; $translateX: number }>`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95), 
    rgba(248, 250, 255, 0.95));
  border-radius: 24px;
  padding: 40px 32px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  width: 240px;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 
    0 10px 40px rgba(59, 130, 246, 0.15),
    0 0 0 1px rgba(59, 130, 246, 0.1) inset;
  transform: ${props => props.$isVisible 
    ? `rotate(${props.$rotation}deg) translateX(0)` 
    : `rotate(0deg) translateX(${-props.$translateX}px)`};
  opacity: ${props => props.$isVisible ? 1 : 0.3};
  z-index: ${props => props.$zIndex};
  border: 2px solid transparent;
  background-clip: padding-box;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(135deg, 
      rgba(147, 197, 253, 0.8),
      rgba(196, 181, 253, 0.8),
      rgba(147, 197, 253, 0.8));
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: rotate(0deg) translateY(-20px) scale(1.05);
    box-shadow: 
      0 20px 60px rgba(59, 130, 246, 0.25),
      0 0 0 1px rgba(59, 130, 246, 0.2) inset;
    z-index: 10;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 1), 
      rgba(245, 248, 255, 1));
    
    &::before {
      opacity: 1;
      background: linear-gradient(135deg, 
        rgba(96, 165, 250, 1),
        rgba(167, 139, 250, 1),
        rgba(96, 165, 250, 1));
    }
  }

  @media (max-width: 1200px) {
    width: 200px;
    height: 280px;
    padding: 32px 24px;
  }

  @media (max-width: 1024px) {
    transform: ${props => props.$isVisible 
      ? `rotate(0deg) translateX(0)` 
      : `rotate(0deg) translateX(${-props.$translateX * 0.5}px)`};
    width: 220px;
    height: 300px;
  }
  
  @media (max-width: 640px) {
    width: calc(50% - 10px);
    max-width: 100%;
    height: auto;
    min-height: 120px;
    padding: 20px 16px;
    transform: translateX(0) !important;
    opacity: ${props => props.$isVisible ? 1 : 0};
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
    box-shadow: 
      0 6px 24px rgba(59, 130, 246, 0.18),
      0 0 0 1px rgba(59, 130, 246, 0.12) inset;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:hover {
      transform: translateY(-4px) !important;
      box-shadow: 
        0 8px 32px rgba(59, 130, 246, 0.22),
        0 0 0 1px rgba(59, 130, 246, 0.18) inset;
    }
  }

  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.95), 
      rgba(51, 65, 85, 0.95));
    box-shadow: 
      0 10px 40px rgba(96, 165, 250, 0.2),
      0 0 0 1px rgba(96, 165, 250, 0.15) inset;
    
    &::before {
      background: linear-gradient(135deg, 
        rgba(96, 165, 250, 0.6),
        rgba(167, 139, 250, 0.6),
        rgba(96, 165, 250, 0.6));
    }
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(51, 65, 85, 1), 
        rgba(71, 85, 105, 1));
      box-shadow: 
        0 20px 60px rgba(96, 165, 250, 0.3),
        0 0 0 1px rgba(96, 165, 250, 0.3) inset;
    }
  }
`;

const CardLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  opacity: 0.8;
  text-align: center;
  
  @media (max-width: 640px) {
    font-size: 9px;
    margin-bottom: 6px;
    letter-spacing: 0.03em;
  }
  
  :root[data-theme="dark"] & {
    color: #93c5fd;
  }
`;

const CardTitle = styled.h3`
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  word-break: keep-all;
  text-align: center;
  
  @media (max-width: 640px) {
    font-size: 18px;
    margin-bottom: 0;
    line-height: 1.3;
  }
  
  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const CardIcon = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  margin-top: auto;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 16px rgba(59, 130, 246, 0.3));
  transition: transform 0.3s ease;
  
  @media (max-width: 640px) {
    display: none;
  }
  
  ${ServiceCard}:hover & {
    transform: scale(1.1);
    filter: drop-shadow(0 6px 20px rgba(59, 130, 246, 0.4));
  }
`;

/* ====== 코딩 연습 섹션 ====== */
const WhiteBackground = styled.div`
  background: #ffffff;
  width: 100%;
  position: relative;
  z-index: 1;
  
  :root[data-theme="dark"] & {
    background: #0f172a;
  }
`;

const PracticeSection = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 170px 20px 10px;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 80px 16px 10px;
  }
`;

const PracticeIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @media (max-width: 640px) {
    width: 90px;
    height: 90px;
    font-size: 48px;
  }
`;

const PracticeTitle = styled.h2`
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
  color: #1e293b;
  word-break: keep-all;
  line-height: 1.3;
  
  @media (max-width: 640px) {
    font-size: 28px;
    margin-bottom: 16px;
  }
  
  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const PracticeHighlight = styled.span`
  background: linear-gradient(135deg, #4F9CF9 0%, #10B981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
`;

const PracticeDescription = styled.p`
  font-size: clamp(16px, 2.5vw, 20px);
  color: #64748b;
  margin-bottom: 60px;
  line-height: 1.7;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 40px;
  }
  
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 40px;
  }
`;

const StepCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: left;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(139, 92, 246, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
  }
  
  @media (max-width: 640px) {
    padding: 32px 24px;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-4px);
    }
  }
  
  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
    border-color: rgba(139, 92, 246, 0.2);
  }
`;

const StepBadge = styled.div`
  display: inline-block;
  padding: 6px 16px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  text-transform: uppercase;
  
  @media (max-width: 640px) {
    font-size: 11px;
    padding: 5px 14px;
    margin-bottom: 16px;
  }
`;

const StepTitle = styled.h3`
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const StepDescription = styled.p`
  font-size: clamp(15px, 2vw, 17px);
  color: #64748b;
  line-height: 1.7;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.6;
  }
  
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const MockupCard = styled.div`
  background: linear-gradient(135deg, #10b981, #06b6d4);
  border-radius: 20px;
  padding: 40px;
  color: white;
  margin-top: 60px;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
  text-align: center;
  
  @media (max-width: 640px) {
    padding: 32px 24px;
    margin-top: 40px;
    border-radius: 16px;
  }
  
  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, #059669, #0891b2);
  }
`;

const MockupTitle = styled.h4`
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 800;
  margin-bottom: 12px;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const MockupText = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  opacity: 0.95;
  line-height: 1.6;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 1.5;
  }
`;

/* ====== 기능 소개 섹션 ====== */
const FeaturesSection = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 80px auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    margin: 40px auto;
    padding: 0 16px;
  }
`;

const FeatureRow = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$reverse ? '1fr 1fr' : '1fr 1fr'};
  gap: ${props => props.$reverse ? '100px' : '60px'};
  align-items: center;
  margin-bottom: 180px;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateY(${props => props.$isVisible ? '0' : '60px'});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 100px;
  }
  
  @media (max-width: 640px) {
    gap: 24px;
    margin-bottom: 60px;
    padding: 0;
  }
`;

const FeatureContent = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  order: ${props => props.$reverse ? 2 : 1};
  padding-left: ${props => props.$reverse ? '40px' : '0'};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : (props.$reverse ? '40px' : '-40px')});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
  
  @media (max-width: 968px) {
    order: 1;
    padding-left: 0;
    transform: translateX(0);
  }
  
  @media (max-width: 640px) {
    padding: 0;
  }
`;

const FeatureImageBox = styled.div<{ $reverse?: boolean; $isVisible?: boolean }>`
  order: ${props => props.$reverse ? 1 : 2};
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 24px;
  padding: 60px 40px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(148, 163, 184, 0.2);
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : (props.$reverse ? '-40px' : '40px')}) scale(${props => props.$isVisible ? 1 : 0.95});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
    border-radius: 16px;
  }
  
  @media (max-width: 968px) {
    order: 2;
    min-height: 300px;
    transform: translateX(0) scale(${props => props.$isVisible ? 1 : 0.95});
  }
  
  @media (max-width: 640px) {
    min-height: 200px;
    max-height: 240px;
    padding: 32px 20px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    margin: 0;
    
    &::before {
      width: 70%;
      height: 70%;
    }
  }
  
  :root[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8));
    border-color: rgba(148, 163, 184, 0.1);
  }
`;

const FeatureImagePlaceholder = styled.div`
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  z-index: 1;
  
  @media (max-width: 640px) {
    font-size: 16px;
  }
  
  :root[data-theme="dark"] & {
    color: #64748b;
  }
`;

const FeatureBadge = styled.div`
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  color: #3b82f6;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
  
  @media (max-width: 640px) {
    font-size: 12px;
    padding: 6px 16px;
    margin-bottom: 16px;
  }
  
  :root[data-theme="dark"] & {
    color: #60a5fa;
  }
`;

const FeatureTitle = styled.h3`
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
  line-height: 1.3;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const FeatureHighlight = styled.span`
  color: #3AA5D0;
  position: relative;
`;

const FeatureDescription = styled.p`
  font-size: clamp(16px, 2vw, 19px);
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 24px;
  word-break: keep-all;
  
  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const FeatureListItem = styled.li`
  font-size: clamp(15px, 2vw, 17px);
  color: #475569;
  padding: 12px 0;
  padding-left: 32px;
  position: relative;
  word-break: keep-all;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: 900;
    font-size: 20px;
  }
  
  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px 0;
    padding-left: 28px;
    
    &::before {
      font-size: 18px;
    }
  }
  
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

/* ========== 하단 AI 면접 소개 섹션 ========== */
const scrollLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const HomeFiveSection = styled.section`
  max-width: 900px;
  margin: 320px auto 180px;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin: 150px auto 100px;
    padding: 0 16px;
  }
`;

const TitleBox = styled.div`
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  letter-spacing: 1px;
  display: inline-block;
  position: relative;
  background: linear-gradient(135deg, #4f9cf9 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  text-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.25),
      0px 8px 20px rgba(16, 185, 129, 0.3),
      0px 8px 20px rgba(79, 156, 249, 0.3);
  transform: perspective(500px) rotateX(10deg);
  transition: all 0.4s ease-in-out;
  margin-bottom: 50px;

  &:hover {
    transform: perspective(500px) rotateX(0deg) scale(1.05);
    text-shadow:
        0px 6px 12px rgba(0, 0, 0, 0.3),
        0px 12px 30px rgba(16, 185, 129, 0.4),
        0px 12px 30px rgba(79, 156, 249, 0.4);
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    transform: perspective(500px) rotateX(5deg);
  }
`;

const Hero = styled.div`
  margin-bottom: 40px;
  h2 {
    font-size: clamp(24px, 4vw, 32px);
    font-weight: 700;
    margin-bottom: 12px;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  p {
    font-size: clamp(16px, 2.5vw, 18px);
    line-height: 1.6;
    color: #475569;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }
`;

const Features = styled.div`
  margin-top: 60px;
  h2 {
    font-size: clamp(20px, 3vw, 24px);
    font-weight: 600;
    margin-bottom: 16px;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  p {
    font-size: clamp(14px, 2vw, 16px);
    color: #64748b;
    line-height: 1.8;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #94a3b8;
    }
  }
`;

const Companies = styled.div`
  margin-top: 60px;
  text-align: center;
  h3 {
    font-size: clamp(18px, 2.5vw, 20px);
    font-weight: 600;
    color: #0f172a;
    word-break: keep-all;
    
    :root[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
`;

const LogoSlider = styled.div`
  overflow: hidden;
  width: 100%;
  margin-top: 20px;
  
  @media (max-width: 640px) {
    margin-top: 16px;
  }
`;

const LogoTrack = styled.div`
  display: flex;
  gap: 40px;
  animation: ${scrollLeft} 20s linear infinite;
  
  @media (max-width: 640px) {
    gap: 30px;
    animation: ${scrollLeft} 15s linear infinite;
  }
`;

const LogoItemWrap = styled.div`
  width: 120px;
  height: 120px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(0.3);
  transition: transform 0.3s ease, filter 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    filter: grayscale(0);
  }
  
  @media (max-width: 640px) {
    width: 90px;
    height: 90px;
  }
`;


const BlueText = styled.strong`
  color: #3b82f6;
`;

const ConfettiCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
  z-index: 9999;
`;

/* ========== SVG 스트로크 로고 컴포넌트 ========== */
type SvgStrokeLogoProps = {
  src: string;
  size?: number;
  stroke?: number;
  color?: string;
};

function SvgStrokeLogo({
  src,
  size = 120,
  stroke = 1,
  color = "#fff",
}: SvgStrokeLogoProps) {
  const rawId = useId().replace(/[:]/g, "");
  const strokeId = `stroke-${rawId}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
      filter={`url(#${strokeId})`}
    >
      <defs>
        <filter
          id={strokeId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={stroke}
            result="DILATE"
          />
          <feFlood floodColor={color} />
          <feComposite in2="DILATE" operator="in" result="STROKE" />
          <feMerge>
            <feMergeNode in="STROKE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image
        href={src}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

/* ========== 메인 컴포넌트 ========== */
export default function Main() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const confettiFnRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const cooldownRef = useRef(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(true);
  const [areCardsVisible, setAreCardsVisible] = useState(false);
  const [featureVisibility, setFeatureVisibility] = useState([false, false, false, false]);

  // Confetti 초기화
  useEffect(() => {
    if (canvasRef.current && !confettiFnRef.current) {
      confettiFnRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
    return () => {
      confettiFnRef.current = null;
    };
  }, []);

  // Confetti 발사 효과
  useEffect(() => {
    if (!sectionRef.current) return;
    const el = sectionRef.current;
    const fire = () => {
      const fn = confettiFnRef.current;
      if (!fn) return;
      const shot = (r: number, o: any) =>
        fn({ ...o, particleCount: Math.floor(200 * r), origin: { y: 0.8 } });
      shot(0.25, { spread: 26, startVelocity: 55 });
      shot(0.2, { spread: 60 });
      shot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      shot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      shot(0.1, { spread: 120, startVelocity: 45 });
    };
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          if (e.isIntersecting && !document.hidden && !cooldownRef.current) {
            fire();
            cooldownRef.current = true;
            setTimeout(() => (cooldownRef.current = false), 3500);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const serviceSectionTitle = document.querySelector('[data-service-title]');
      if (serviceSectionTitle) {
        const rect = serviceSectionTitle.getBoundingClientRect();
        // 타이틀이 화면 상단 100px 이내에 들어오면 배경 글자 숨김
        setIsBackgroundVisible(rect.top > 100);
      }

      // 카드 애니메이션 트리거 (반복 가능)
      const serviceGrid = document.querySelector('[data-service-grid]');
      if (serviceGrid) {
        const rect = serviceGrid.getBoundingClientRect();
        // 그리드가 화면에 보이면 카드 표시, 벗어나면 숨김
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.2) {
          setAreCardsVisible(true);
        } else {
          setAreCardsVisible(false);
        }
      }

      // 기능 섹션 애니메이션 트리거 (더 일찍 시작)
      const featureRows = document.querySelectorAll('[data-feature-row]');
      
      setFeatureVisibility(prevVisibility => {
        const newVisibility = [...prevVisibility];
        featureRows.forEach((row, index) => {
          const rect = row.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            newVisibility[index] = true;
          } else {
            newVisibility[index] = false;
          }
        });
        return newVisibility;
      });
    };

    // 초기 체크
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Page>
      <BackgroundTextContainer>
        <BackgroundText $isVisible={isBackgroundVisible}>
          <span>JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · </span>
          <span>JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · JOB SPOON · </span>
        </BackgroundText>
      </BackgroundTextContainer>
      <HeroSection>
        <MainTitle>
          AI로 검증하는 <Highlight>면접솔루션</Highlight>,
          <br />
          잡스푼
          <br />
          Job-Spoon
        </MainTitle>
        <Subtitle>
          잡스푼과 함께, 더 똑똑하고 효과적인 면접을 경험하세요
          <br />
          면접 AI 함께 가나다라 마바사
        </Subtitle>
        <ButtonGroup>
          <PrimaryButton href="#start">
            AI 면접 시작하기 →
          </PrimaryButton>
          {/*<SecondaryButton href="#free">*/}
          {/*  무료 체험*/}
          {/*</SecondaryButton>*/}
          {/*<BlueButton href="#guide">*/}
          {/*  도입 문의*/}
          {/*</BlueButton>*/}
        </ButtonGroup>
      </HeroSection>

      <ServiceSection>
        <ServiceTitle data-service-title>
          <Highlight>취업 준비</Highlight>, 어디까지 해보셨나요?
        </ServiceTitle>
        <ServiceSubtitle>
          ↓ 잡스푼은 다양한 방향의 취업 준비 솔루션을 제공합니다
        </ServiceSubtitle>
        
        <ServiceGrid data-service-grid>
          <ServiceCard $rotation={-8} $zIndex={1} $translateX={-480} $isVisible={areCardsVisible} style={{ transitionDelay: '0.2s' }}>
            <CardLabel>Lecture Room</CardLabel>
            <CardTitle>면접 스터디</CardTitle>
            <CardIcon>✏️</CardIcon>
          </ServiceCard>

          <ServiceCard $rotation={-4} $zIndex={2} $translateX={-240} $isVisible={areCardsVisible} style={{ transitionDelay: '0.1s' }}>
            <CardLabel>Treatment Room</CardLabel>
            <CardTitle>기술 용어</CardTitle>
            <CardIcon>💉</CardIcon>
          </ServiceCard>

          <ServiceCard $rotation={0} $zIndex={3} $translateX={0} $isVisible={areCardsVisible} style={{ transitionDelay: '0s' }}>
            <CardLabel>Conference Room</CardLabel>
            <CardTitle>AI 모의 면접</CardTitle>
            <CardIcon>📋</CardIcon>
          </ServiceCard>

          <ServiceCard $rotation={4} $zIndex={2} $translateX={240} $isVisible={areCardsVisible} style={{ transitionDelay: '0.1s' }}>
            <CardLabel>Waiting Room</CardLabel>
            <CardTitle>나만의 퀴즈</CardTitle>
            <CardIcon>💺</CardIcon>
          </ServiceCard>

          <ServiceCard $rotation={8} $zIndex={1} $translateX={480} $isVisible={areCardsVisible} style={{ transitionDelay: '0.2s' }}>
            <CardLabel>Consultation Room</CardLabel>
            <CardTitle>스케줄관리</CardTitle>
            <CardIcon>💬</CardIcon>
          </ServiceCard>
        </ServiceGrid>
      </ServiceSection>

      <WhiteBackground>
        <PracticeSection>
          <PracticeIcon><img style={{ width: "120px", height: "auto" }} src={image} /></PracticeIcon>
          <PracticeTitle>
            취업도 처음이라면, <br />
            <PracticeHighlight>연습</PracticeHighlight>이 필요합니다
          </PracticeTitle>
          <PracticeDescription>
            처음이라면 연습과 준비가 필요합니다 잡스푼이 당신의 취업에 함께하겠습니다
          </PracticeDescription>
        </PracticeSection>

        <FeaturesSection>
        {/* 첫 번째 기능 - 텍스트 왼쪽 */}
        <FeatureRow data-feature-row $isVisible={featureVisibility[0]}>
          <FeatureContent $isVisible={featureVisibility[0]}>
            <FeatureBadge>FEATURE 01</FeatureBadge>
            <FeatureTitle>
              디스플레이로<br />
              <FeatureHighlight>일정과 상태를</FeatureHighlight><br />
              확인하세요
            </FeatureTitle>
            <FeatureDescription>
              취업 준비중 많은 일정<br />
              한번에 확인하고 관리하세요
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
            </FeatureList>
          </FeatureContent>
          <FeatureImageBox $isVisible={featureVisibility[0]}>
            <FeatureImagePlaceholder>
              이미지
            </FeatureImagePlaceholder>
          </FeatureImageBox>
        </FeatureRow>

        {/* 두 번째 기능 - 텍스트 오른쪽 */}
        <FeatureRow data-feature-row $reverse $isVisible={featureVisibility[1]}>
          <FeatureContent $reverse $isVisible={featureVisibility[1]}>
            <FeatureBadge>FEATURE 02</FeatureBadge>
            <FeatureTitle>
              AI 면접으로<br />
              <FeatureHighlight>실전 감각을</FeatureHighlight><br />
              키워보세요
            </FeatureTitle>
            <FeatureDescription>
              실제 면접과 동일한 환경에서<br />
              AI와 함께 연습하고 피드백을 받아보세요.
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
            </FeatureList>
          </FeatureContent>
          <FeatureImageBox $reverse $isVisible={featureVisibility[1]}>
            <FeatureImagePlaceholder>
              이미지
            </FeatureImagePlaceholder>
          </FeatureImageBox>
        </FeatureRow>

        {/* 세 번째 기능 - 텍스트 왼쪽 */}
        <FeatureRow data-feature-row $isVisible={featureVisibility[2]}>
          <FeatureContent $isVisible={featureVisibility[2]}>
            <FeatureBadge>FEATURE 03</FeatureBadge>
            <FeatureTitle>
              스터디 그룹으로<br />
              <FeatureHighlight>함께 성장</FeatureHighlight><br />
              하세요
            </FeatureTitle>
            <FeatureDescription>
              혼자 준비하기 어렵다면?<br />
              스터디 그룹에 참여하여 함께 준비하세요.
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
            </FeatureList>
          </FeatureContent>
          <FeatureImageBox $isVisible={featureVisibility[2]}>
            <FeatureImagePlaceholder>
              이미지
            </FeatureImagePlaceholder>
          </FeatureImageBox>
        </FeatureRow>

        {/* 네 번째 기능 - 텍스트 오른쪽 */}
        <FeatureRow data-feature-row $reverse $isVisible={featureVisibility[3]}>
          <FeatureContent $reverse $isVisible={featureVisibility[3]}>
            <FeatureBadge>FEATURE 04</FeatureBadge>
            <FeatureTitle>
              나만의 퀴즈로<br />
              <FeatureHighlight>실력을 점검</FeatureHighlight><br />
              하세요
            </FeatureTitle>
            <FeatureDescription>
              내가 약한 부분을 집중적으로!<br />
              맞춤형 퀴즈로 효율적으로 학습하세요.
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
              <FeatureListItem>와랄랄ㄹ라라라</FeatureListItem>
            </FeatureList>
          </FeatureContent>
          <FeatureImageBox $reverse $isVisible={featureVisibility[3]}>
            <FeatureImagePlaceholder>
              이미지 영역
            </FeatureImagePlaceholder>
          </FeatureImageBox>
        </FeatureRow>
      </FeaturesSection>
        <HomeFiveSection ref={sectionRef}>
          <Hero>
            <TitleBox>JOB SPOON</TitleBox>
            <h2>국내 최초, 개발자를 위한 AI 모의 면접 플랫폼</h2>
            <p>
              <BlueText>JobSpoon</BlueText>은 진짜 면접처럼 연습하고, <br />
              기업 맞춤 정보를 통해 자신 있게 면접을 준비할 수 있도록 돕습니다.
            </p>
          </Hero>
          <Features>
            <h2>
              <BlueText>JobSpoon</BlueText>은 이렇게 다릅니다
            </h2>
            <p>
              단순한 질문 생성기가 아닙니다. <br />
              각 기업이 요구하는 조건, 자주 묻는 질문, 실제 면접에서 사용된 질문을
              수집하고 분석하여
              <br />
              사용자에게 맞춤형으로 제공하는 국내 최초 개발자 특화 면접 준비
              사이트입니다.
            </p>
          </Features>
          <Companies>
            <h3>
              현재 <BlueText>JobSpoon</BlueText>이 지원하는 기업
            </h3>
            <LogoSlider>
              <LogoTrack>
                {[logoDanggeun, logoToss, logoEncore, logoKT, logoDanggeun, logoToss, logoEncore, logoKT].map((src, i) => (
                  <LogoItemWrap key={`${src}-${i}`}>
                    <SvgStrokeLogo src={src} size={120} stroke={1} />
                  </LogoItemWrap>
                ))}
              </LogoTrack>
            </LogoSlider>
          </Companies>
          <ConfettiCanvas ref={canvasRef} />
        </HomeFiveSection>

        
      </WhiteBackground>


      <ScrollTopButton onClick={scrollToTop} aria-label="맨 위로">
        ↑
      </ScrollTopButton>
    </Page>
  );
}
