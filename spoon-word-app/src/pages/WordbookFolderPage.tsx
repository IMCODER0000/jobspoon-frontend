import React from "react";
import { NarrowLeft } from "../styles/layout";
import styled from "styled-components";
import { useParams, useNavigate, useLocation, useSearchParams, useNavigationType } from "react-router-dom";
import http, { authHeader } from "../utils/http";
import SpoonNoteModal from "../components/SpoonNoteModal";
import { fetchUserFolders, patchReorderFolders } from "../api/userWordbook";
import TermCard from "../components/TermCard";
import { setMemorization, fetchMemorizationStatuses } from "../api/memorization";
import { moveFolderTerms } from "../api/userWordbookTerms";
import { renameUserFolder, deleteUserFolder } from "../api/folder";
import { generatePdfByTermIds } from "../api/ebook";
import { saveBlob } from "../utils/download";
import { sanitizeFilename } from "../utils/cdFilename";
import { goToAccountLogin } from "../utils/auth";
import { startQuizUnified } from "../api/quiz";

/** 서버 응답에서 안전하게 뽑아둘 필드들 */
type TermRow = any;
type TermItem = {
    uwtId: string;
    termId: string | null;
    title: string;
    description: string;
    createdAt?: string;
    tags?: string[];
};

type Notebook = { id: string; name: string };
// 전체 보기 모드: 상속/전체숨김/전체표시
type ViewMode = "inherit" | "allHidden" | "allShown";

const UI = {
    color: {
        bg: "#ffffff",
        panel: "#f8fafc",
        text: "#111827",
        sub: "#374151",
        muted: "#6b7280",
        line: "#e5e7eb",
        indigo: "#6366f1",
        indigo50: "#eef2ff",
        indigo200: "#c7d2fe",
        primary: "#4F76F1",
        primaryStrong: "#3E63E0",
        danger: "#ef4444",
        quizHover: "#2c73e5",
    },
    gradient: {
        brand: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
        brandSoft:
            "linear-gradient(135deg, rgba(79,118,241,0.12) 0%, rgba(62,99,224,0.12) 100%)",
        quizCta: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
    },
    radius: { xl: 20, lg: 14, md: 12, sm: 10, pill: 999 },
    shadow: {
        card: "0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.06)",
        bar: "0 6px 20px rgba(0,0,0,0.06)",
        menu: "0 8px 24px rgba(0,0,0,0.12)",
    },
    space: (n: number) => `${n}px`,
    font: { h2: "22px", body: "15px", tiny: "12px" },
};

/* ---------- 상단 툴바 ---------- */
const Toolbar = styled.div`
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${UI.color.bg};
    //border-bottom: 1px solid ${UI.color.line};
    padding: 12px 8px;
    margin-bottom: 16px;
    // box-shadow: ${UI.shadow.bar};
`;

const ChipRow = styled.div` display:flex; flex-wrap:wrap; gap:10px; align-items:center; `;

const Title = styled.h2`
    margin: 0;
    font-size: ${UI.font.h2};
    letter-spacing: -0.01em;
    color: ${UI.color.text};
`;

const Count = styled.span`
    margin-left: 8px;
    font-size: ${UI.font.body};
    font-weight: 400;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    line-height: 1;           /* 라인 높이 통일 */
`;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

/* ---------- 설정 버튼 + 메뉴 ---------- */

const PdfSubMenu = styled.div`
    position: absolute;
    top: 0;
    left: -8px;
    right: -8px;
    margin-top: 42px;
    background: #fff;
    border: 1px solid ${UI.color.line};
    border-radius: 12px;
    box-shadow: ${UI.shadow.menu};
    padding: 6px;
    z-index: 7;
`;

const RadioItem = styled.button<{ $checked?: boolean }>`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover {
    background: #f9fafb;
  }
  & > span:first-child {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: ${({ $checked }) => ($checked ? UI.gradient.brand : "transparent")};
  }
`;

/* ---------- 리스트/카드 ---------- */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
`;

const CHECK_W = 28;
const CHECK_GAP = 10;
const TITLE_SHIFT = CHECK_W + CHECK_GAP;

/** TermCard 내부의 + 버튼 숨김, 제목/설명 가리기, 연관 키워드 숨기기 */
const HideTermCardAdd = styled.div<{ $hideTitle?: boolean; $hideDesc?: boolean }>`
    /* TermCard 내부의 + 버튼 완전 숨김 (두 환경 라벨 모두 처리) */
    article [aria-label="내 단어장에 추가"],
    article [aria-label="내 스푼노트에 추가"] {
        display: none !important;
    }

    /* 제목은 항상 살짝 오른쪽으로 밀어 체크와 정렬 */
    article h3[id^="term-"] {
        margin-left: ${TITLE_SHIFT}px !important;
    }

  /* 제목 숨김 모드 */
  ${({ $hideTitle }) =>
    $hideTitle &&
    `
      article h3[id^="term-"]{
        position: relative;
        color: transparent !important;
        text-shadow: none !important;
        user-select: none;
      }
      article h3[id^="term-"]::selection { background: transparent; }
      article h3[id^="term-"]::after{
        content: "";
        position: absolute;
        left: -6px;
        right: -6px;
        top: -2px;
        bottom: -2px;
        background: ${UI.color.panel};
        border-radius: 10px;
        pointer-events: none;
      }
  `}

  ${({ $hideDesc }) =>
    $hideDesc &&
    `
      article > div:nth-of-type(2) { position: relative; }
      article > div:nth-of-type(2) p {
        color: transparent !important;
        text-shadow: none !important;
        user-select: none;
      }
      article > div:nth-of-type(2) p::selection { background: transparent; }
  `}

  article [aria-label="연관 키워드"] {
    display: none !important;
  }
`;

const CardWrap = styled.div`
  position: relative;
  border-radius: ${UI.radius.xl}px;
`;

/** 항상 보이는 좌측 체크(첨부칩 느낌) */
const SelectToggle = styled.button<{ $on?: boolean }>`
    position: absolute;
    top: 22px;
    left: 20px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: ${UI.radius.pill}px;
    border: 0;

    background: ${({ $on }) => ($on ? UI.gradient.brand : UI.gradient.brandSoft)};
    color: ${({ $on }) => ($on ? "#fff" : "#0f172a")};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);

    cursor: pointer;
    line-height: 0;
    overflow: hidden;
    contain: paint;
    backface-visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease, filter 160ms ease;

    &:hover {
        filter: brightness(0.98);
    }
    &:active {
        transform: scale(0.97);
    }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.35);
    }
`;

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden="true">
        <path
            d="M20 7L10 17l-6-6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

/* 비선택 점선도 동일 계열 파랑 */
const Hollow = styled.span`
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid ${UI.color.primaryStrong};
    background: rgba(255, 255, 255, 0.7);
    display: block;
`;

/** 암기 상태 칩도 동일 톤으로 */
const StatusBtn = styled.button<{ $done?: boolean }>`
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;

    height: 28px;
    padding: 0 12px;
    border-radius: ${UI.radius.pill}px;
    border: 1px solid ${({ $done }) => ($done ? UI.color.indigo200 : UI.color.line)};
    background: ${({ $done }) => ($done ? UI.color.indigo50 : "#fff")};
    color: ${({ $done }) => ($done ? UI.color.primaryStrong : UI.color.muted)};

    font-size: ${UI.font.tiny};
    font-weight: 700;
    letter-spacing: -0.06em;
    cursor: pointer;

    box-shadow: none; /* 이전 인셋 글로시 제거 */
    transition:
            background-color 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            transform 80ms ease;

    &:hover {
        background: ${({ $done }) => ($done ? "#e6edff" : "#fafafa")};
    }
    &:active { transform: scale(0.97); }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.25);
    }
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const LearnRow = styled.div`
    margin-top: 12px;
    margin-left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;

const LearnLabel = styled.span`
    font-size: ${UI.font.tiny};
    font-weight: 700;
    color: ${UI.color.muted};
`;

const LearnSeg = styled.div`
    display: inline-flex;
    border: 1px solid ${UI.color.line};
    border-radius: ${UI.radius.sm}px;
    overflow: hidden;
`;

const LearnBtn = styled.button<{ $active?: boolean }>`
    height: 28px;
    padding: 0 10px;
    background: ${({ $active }) => ($active ? "rgba(79,118,241,0.10)" : "#fff")};
    color: ${({ $active }) => ($active ? UI.color.text : UI.color.sub)};
    border: 0;
    cursor: pointer;
    font-size: ${UI.font.tiny};
    font-weight: 700;
    &:hover {
        background: #f9fafb;
    }
`;

const Empty = styled.div`
    border: 1px dashed ${UI.color.line};
    border-radius: ${UI.radius.xl}px;
    padding: 32px;
    text-align: center;
    color: ${UI.color.muted};
`;

/* 하단 Export Tray */
const Tray = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 7;
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  margin-top: 10px;
`;

/* ---------- Pagination ---------- */
type PaginationProps = {
    page: number; size: number; total: number;
    onChange: (nextPageZeroBased: number) => void;
};
const PaginationNav = styled.nav`
    margin-top: ${UI.space(16)};
    display: flex; align-items: center; justify-content: center;
    gap: ${UI.space(8)}; user-select: none;
`;
const PageNumBtn = styled.button<{ $active: boolean }>`
    min-width: 34px; height: 34px; padding: 0 10px; border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? UI.color.primary : UI.color.line)};
    background: ${({ $active }) => ($active ? UI.color.primary : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : UI.color.text)};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    cursor: pointer;
`;
const NavBtn = styled.button<{ $disabled: boolean }>`
    width: 34px; height: 34px; border-radius: 999px; border: 1px solid ${UI.color.line};
    background: #fff; color: ${({ $disabled }) => ($disabled ? "#c7c7c7" : UI.color.text)};
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    display: inline-flex; align-items: center; justify-content: center;
`;

/* ---------- Option Popup ---------- */
const MetaSep = styled.span`
  margin: 0 8px;
  color: ${UI.color.muted};
`;

const SortInlineWrap = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    isolation: isolate;   /* 내부 z-index를 독립시켜 안전하게 레이어링 */
`;

const SortInlineBtn = styled.button`
    position: relative;
    padding: 0 0px;                 /* 텍스트 간격만 살짝 */
    border: 0;
    background: transparent;
    font-size: ${UI.font.body};
    font-weight: 400;               /* Count와 동일 굵기 */
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    cursor: pointer;
    line-height: 1;                 /* Count와 동일 라인 높이 */
    border-radius: ${UI.radius.pill}px;
    -webkit-tap-highlight-color: transparent;
    z-index: 0;

    /* 박스가 '생기는' 효과: 레이아웃 변화 없이 오버레이만 표시 */
    &::after {
        content: "";
        position: absolute;
        inset: -6px -10px;            /* 위아래/좌우 여백 */
        //border: 1px solid ${UI.color.line};
        background: #fafafa;
        border-radius: 10px;
        opacity: 0;
        transition: opacity 120ms ease;
        pointer-events: none;         /* 클릭 방해 X */
        z-index: -1;
        will-change: opacity;
    }

    &:hover::after,
    &:focus-visible::after,
    &[aria-expanded="true"]::after {
        opacity: 1;                   /* 호버/포커스/열림에 박스 표시 */
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.25); /* 키보드 접근성 */
    }
`;

const SortPopup = styled.div`
  position: absolute;
  top: 22px; /* 타이틀 라인의 아래쪽으로 */
  left: -8px;
  right: auto;
  min-width: 220px;
  background: #fff;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  box-shadow: ${UI.shadow.menu};
  padding: 6px;
  z-index: 8;
`;

/* ---------- QuizCta ---------- */
const QuizCta = styled.button`
    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: 42px;
    padding: 0 18px;
    border: 0;
    border-radius: 8px;
    background: ${UI.gradient.quizCta};
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 1;
    letter-spacing: -0.02em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.25);
    -webkit-tap-highlight-color: transparent;
    transition: transform 80ms ease;
    z-index: 0;                 /* 버튼 자체를 스택 컨텍스트 0으로 */

    /* 텍스트/아이콘은 항상 오버레이 위로 */
    & > * { position: relative; z-index: 1; }

    /* 왼→오 채우는 오버레이 */
    &::before{
        content: "";
        position: absolute;
        inset: 0;
        background: ${UI.color.quizHover};   /* #2c73e5 */
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 260ms ease;
        z-index: -1;              /* 오버레이를 텍스트 뒤로 */
        pointer-events: none;
        will-change: transform;
    }

    &:hover::before,
    &:focus-visible::before { transform: scaleX(1); }

    &:active { transform: scale(0.98); }
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,.28);
    }

    @media (prefers-reduced-motion: reduce) {
        &::before{ transition: none; }
    }
`;


const PlusDot = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);


const Pagination: React.FC<PaginationProps> = ({ page, size, total, onChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
    const current = page + 1; // 1-base
    const maxNumbers = 10;

    let start = Math.max(1, current - Math.floor(maxNumbers / 2));
    let end = Math.min(totalPages, start + maxNumbers - 1);
    start = Math.max(1, end - maxNumbers + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const go = (p1: number) => {
        if (p1 < 1 || p1 > totalPages || p1 === current) return;
        onChange(p1 - 1);
    };

    return (
        <PaginationNav aria-label="페이지네이션">
            <NavBtn aria-label="처음" onClick={() => go(1)} disabled={current === 1} $disabled={current === 1}>«</NavBtn>
            <NavBtn aria-label="이전" onClick={() => go(current - 1)} disabled={current === 1} $disabled={current === 1}>‹</NavBtn>
            {nums.map((n) => (
                <PageNumBtn key={n} onClick={() => go(n)} aria-current={n === current ? "page" : undefined} $active={n === current}>
                    {n}
                </PageNumBtn>
            ))}
            <NavBtn aria-label="다음" onClick={() => go(current + 1)} disabled={current === totalPages} $disabled={current === totalPages}>›</NavBtn>
            <NavBtn aria-label="마지막" onClick={() => go(totalPages)} disabled={current === totalPages} $disabled={current === totalPages}>»</NavBtn>
        </PaginationNav>
    );
};

/* ---------- Quiz Setup Modal ---------- */
const Scrim = styled.div`
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(15, 23, 42, .45);
    backdrop-filter: saturate(120%) blur(2px);
`;

const Sheet = styled.div`
    position: fixed; z-index: 1001;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: min(920px, calc(100% - 32px));
    max-height: min(84vh, calc(100vh - 32px));
    display: flex; flex-direction: column;
    background: #fff; border: 1px solid ${UI.color.line};
    border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.18);
    overflow: hidden;
    --sheet-pad-x: 24px;
    /* 아이콘(36) + gap(12) = 48px 만큼 헤더만 추가 인덴트 */
    --sheet-header-indent: 48px;
`;

const SheetHeader = styled.div`
    position: relative;
    padding: 20px var(--sheet-pad-x) 16px;
    display:flex; align-items:center; gap:12px;
    border-bottom: 1px solid ${UI.color.line};
    background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
`;
const TitleWrap = styled.div`
    display:flex; flex-direction:column; gap:4px;
    h3{ margin:0; font-size:20px; letter-spacing:-0.02em; }
    small{ color:${UI.color.muted}; font-weight:400; }
`;
const CloseX = styled.button`
    margin-left:auto; border:0; background:transparent; cursor:pointer;
    width:34px; height:34px; border-radius:10px;
    display:grid; place-items:center; color:#6b7280;
    &:hover{ background:#f3f4f6; color:#111827; }
`;

const SheetBody = styled.div`
    padding: 18px var(--sheet-pad-x) 8px;
    overflow: auto;
    scrollbar-gutter: stable;
`;
const Section = styled.section`
    &:not(:first-child){ margin-top: 18px; }
    h4{ margin:0 0 10px; font-size:14px; color:#0f172a; letter-spacing:-0.02em; }
`;

const Cards2 = styled.div`
    display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
    @media (max-width: 720px){ grid-template-columns: 1fr; }
`;

const OptionCard = styled.button<{ $on?: boolean }>`
    text-align:left; padding:16px; border-radius:14px; cursor:pointer;
    border: 1px solid ${({$on}) => $on ? UI.color.indigo200 : UI.color.line};
    background: ${({$on}) => $on ? UI.color.indigo50 : "#fff"};
    display:flex; gap:12px; align-items:flex-start;
    transition: border-color 140ms ease, background-color 140ms ease, transform 80ms ease;
    &:hover{ background:#fafafa; }
    &:active{ transform: scale(.99); }
    h5{ margin:0 0 4px; font-size:15px; }
    p{ margin:0; color:${UI.color.muted}; font-size:13px; }
`;

const IconBox = styled.span`
    width:36px; height:36px; border-radius:10px;
    display:grid; place-items:center;
    background: ${UI.gradient.brandSoft};
    color: ${UI.color.primaryStrong};
    flex: 0 0 auto;
`;

const Chip = styled.button<{ $on?: boolean }>`
    height: 34px; padding: 0 14px; border-radius: 999px; font-weight:700; letter-spacing:-0.02em;
    border:1px solid ${({$on}) => $on ? UI.color.indigo200 : UI.color.line};
    background: ${({$on}) => $on ? UI.color.indigo50 : "#fff"};
    color: ${({$on}) => $on ? UI.color.primaryStrong : UI.color.text};
    cursor:pointer; &:hover{ background:#f9fafb; }
`;

const CountChip = styled(Chip)<{ $on?: boolean }>`
    /* 색상만 상태에 따라 바뀌게 */
    color: ${({ $on }) => ($on ? UI.color.primaryStrong : UI.color.muted)};
    font-weight: ${({ $on }) => ($on ? 700 : 500)};

    /* 부드러운 전환 */
    transition:
            background-color 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            box-shadow 140ms ease,
            transform 80ms ease;
    will-change: background-color, border-color, color, transform;
    -webkit-tap-highlight-color: transparent;

    /* 선택/비선택 각각 자연스러운 hover 색 */
    &:hover {
        background: ${({ $on }) => ($on ? "#e6edff" : "#f9fafb")};
    }

    /* 클릭 프레스 감(부드러운 누름) */
    &:active {
        transform: scale(0.98);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79,118,241,0.25);
    }
`;

const Select = styled.select`
    box-sizing: border-box;     /* 패딩 포함해 overflow 방지 */
    height: 38px;               /* CatBtn과 높이 맞춤 */
    width: 100%;                /* 부모 폭을 꽉 채움 */
    min-width: 0;               /* 기존 320px 제거 -> 그리드 칼럼폭에 맞게 */
    padding: 0 12px;
    border-radius: 12px;
    border:1px solid ${UI.color.line};
    background:#fff;
    font-weight:400;
    color:#374151;
    letter-spacing: -0.02em;
`;

/* ---------- Fancy Folder/Category Dropdown ---------- */

const DDWrap = styled.div`
  position: relative;
`;

const DDTrigger = styled.button<{ $hasValue?: boolean }>`
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid ${UI.color.line};
  background: #fff;
  padding: 0 36px 0 12px;
  text-align: left;
  font-size: 14px;
  font-weight: ${({ $hasValue }) => ($hasValue ? 600 : 500)};
  letter-spacing: -0.02em;
  color: ${({ $hasValue }) => ($hasValue ? UI.color.text : UI.color.muted)};
  cursor: pointer;
  transition: box-shadow .15s ease, border-color .15s ease, transform .08s ease, background .12s ease;
  &:hover { background: #f9fafb; }
  &:active { transform: translateY(1px); }
  &:focus-visible {
    outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25);
    border-color: ${UI.color.primaryStrong};
  }
`;

// 캐럿 회전
const DDCaret = styled.span<{ $open?: boolean }>`
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%) rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform .18s ease;
  pointer-events: none; color: ${UI.color.muted};
  & svg { display:block }
`;

// '지우기' 버튼
const DDClear = styled.button`
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px; height: 22px;
  border: 0; background: transparent; color: ${UI.color.muted};
  border-radius: 999px; cursor: pointer;
  transition: background .12s ease, color .12s ease, transform .08s ease;
  &:hover { background: #f3f4f6; color: ${UI.color.sub}; }
  &:active { transform: translateY(-50%) scale(.96); }
`;

const DDPanel = styled.div`
  position: absolute; top: calc(100% + 6px); left: 0;
  width: min(100%, 520px);
  max-width: 100%;
  max-height: 320px;
  border: 1px solid ${UI.color.line};
  border-radius: 12px;
  background: #fff;
  box-shadow: ${UI.shadow.menu};
  overflow: hidden;
  z-index: 12;
  animation: dd-pop .12s ease;
  @keyframes dd-pop {
    from { opacity: .6; transform: translateY(-2px) scale(.98); }
    to   { opacity: 1;  transform: translateY(0)    scale(1); }
  }
`;

// 검색영역 + 아이콘
const DDSearchWrap = styled.div`
  position: relative;
  border-bottom: 1px solid ${UI.color.line};
  background: #fafafa;
`;

const DDSearchIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${UI.color.muted};
  pointer-events: none;
  & svg { display:block; }
`;

// 기존 DDSearch 개선
const DDSearch = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 12px 0 32px;
  border: 0;
  background: transparent;
  font-size: 14px;
  letter-spacing: -0.01em;
  &:focus { outline: none; background: #f6f8fb; }
`;

// 스크롤 섀도우 컨테이너
const DDListWrap = styled.div<{ $top?: boolean; $bot?: boolean }>`
  position: relative;
  &::before, &::after {
    content: "";
    position: absolute;
    left: 0; right: 0;
    height: 12px;
    pointer-events: none;
    transition: opacity .15s ease;
    z-index: 1;
  }
  &::before {
    top: 0;
    background: linear-gradient(#fff, rgba(255,255,255,0));
    opacity: ${({ $top }) => ($top ? 1 : 0)};
  }
  &::after {
    bottom: 0;
    background: linear-gradient(rgba(255,255,255,0), #fff);
    opacity: ${({ $bot }) => ($bot ? 1 : 0)};
  }
`;

const DDList = styled.div`
  position: relative;
  max-height: 280px; overflow: auto;
  scrollbar-gutter: stable;
`;

// 항목 (depth2 인디케이터 + mark 하이라이트)
const DDItem = styled.button<{ $active?: boolean; $selected?: boolean; $depth2?: boolean }>`
  width: 100%; text-align: left; border: 0; background: transparent;
  display: grid; grid-template-columns: 1fr auto; align-items: center;
  padding: 10px 12px; cursor: pointer;
  color: ${UI.color.text}; letter-spacing:-0.01em;
  transition: background-color .12s ease;
  ${({ $active }) => $active && `background:#f9fafb;`}
  ${({ $selected }) => $selected && `
    background: ${UI.color.indigo50};
    color: ${UI.color.primaryStrong};
  `}
  &:hover { background: #f9fafb; }
  mark {
    background: #fff3cd;
    color: inherit;
    padding: 0 2px;
    border-radius: 3px;
  }
  ${({ $depth2 }) =>
    $depth2 &&
    `
      position: relative;
      padding-left: 20px;
      &::before{
        content: "";
        position: absolute;
        left: 10px;
        top: 50%;
        width: 6px; height: 6px;
        border-radius: 999px;
        background: ${UI.color.primaryStrong};
        opacity: .35;
        transform: translateY(-50%);
      }
  `}
`;

const DDCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7L10 17l-6-6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// 빈 상태
const DDEmpty = styled.div`
  padding: 14px 12px;
  color: ${UI.color.muted};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  svg { opacity: .6; }
`;

/* ---------- 검색어 하이라이트 헬퍼 ---------- */
const renderHL = (text: string, keyword: string): React.ReactNode => {
    const q = keyword.trim();
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
        <>
            {text.slice(0, i)}
            <mark>{text.slice(i, i + q.length)}</mark>
            {text.slice(i + q.length)}
        </>
    );
};

/* ---------- FolderSelect ---------- */
type FolderSelectProps = {
    value: string;
    onChange: (v: string) => void;
    options: Notebook[];
    placeholder?: string;
};

const FolderSelect: React.FC<FolderSelectProps> = ({ value, onChange, options, placeholder="내 스푼노트 폴더 선택" }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, options.length, q, updateShadows]);

    const label = React.useMemo(
        () => options.find(o => String(o.id) === String(value))?.name ?? "",
        [options, value]
    );

    const list = React.useMemo(() => {
        const t = q.trim().toLowerCase();
        return t ? options.filter(o => o.name.toLowerCase().includes(t)) : options;
    }, [q, options]);

    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const pick = (idx: number) => {
        const item = list[idx];
        if (!item) return;
        onChange(String(item.id));
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHover(h => Math.min((h<0? -1 : h) + 1, list.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setHover(h => Math.max((h<0? list.length : h) - 1, 0)); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : 0); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!label}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label || placeholder}
            </DDTrigger>

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="폴더 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="폴더 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {list.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : list.map((n, i) => {
                                const selected = String(n.id) === String(value);
                                return (
                                    <DDItem
                                        key={n.id}
                                        $active={i===hover}
                                        $selected={selected}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=>{ onChange(String(n.id)); setOpen(false); setQ(""); setHover(-1); }}
                                        aria-selected={selected}
                                    >
                                        <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                            {renderHL(n.name, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

const toServerType = (t: "mix" | "choice" | "ox" | "initials") =>
    ({ mix: "MIX", choice: "CHOICE", ox: "OX", initials: "INITIALS" } as const)[t];

const toServerLevel = (l: "mix" | "easy" | "medium" | "hard") =>
    ({ mix: "MIX", easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const)[l];

/* ---------- CategorySelect ---------- */
type CategorySelectProps = {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
    allowClear?: boolean; // 선택 해제 행 노출
};

const CategorySelect: React.FC<CategorySelectProps> = ({
                                                           value,
                                                           onChange,
                                                           options,
                                                           placeholder = "카테고리 선택",
                                                           allowClear = true,
                                                       }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, options.length, q, updateShadows]);

    const label = value || "";

    // 검색 필터링 + (옵션) 상단 '선택 해제' 항목 추가
    type Item = { id: string; label: string; isClear?: boolean };
    const list: Item[] = React.useMemo(() => {
        const t = q.trim().toLowerCase();
        const filtered = (t ? options.filter(o => o.toLowerCase().includes(t)) : options)
            .map(o => ({ id: o, label: o }));
        if (allowClear && value) filtered.unshift({ id: "__CLEAR__", label: "선택 해제", isClear: true });
        return filtered;
    }, [q, options, allowClear, value]);

    // 바깥 클릭/ESC로 닫기
    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const pick = (idx: number) => {
        const item = list[idx];
        if (!item) return;
        if (item.isClear) onChange("");
        else onChange(item.id);
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHover(h => Math.min((h < 0 ? -1 : h) + 1, list.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setHover(h => Math.max((h < 0 ? list.length : h) - 1, 0)); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : 0); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!label}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label || placeholder}
            </DDTrigger>

            {/* 원클릭 선택 해제 */}
            {(allowClear && !!label && !open) && (
                <DDClear aria-label="선택 해제" onClick={(e) => { e.stopPropagation(); onChange(""); }}>
                    ×
                </DDClear>
            )}

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="카테고리 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="카테고리 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {list.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : list.map((it, i) => {
                                const selected = it.id === value && !it.isClear;
                                const depth2 = it.label.startsWith("• ");
                                const clean = depth2 ? it.label.replace(/^•\s*/, "") : it.label;
                                return (
                                    <DDItem
                                        key={`${it.id}-${i}`}
                                        $active={i===hover}
                                        $selected={selected}
                                        $depth2={depth2}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=> pick(i)}
                                        aria-selected={selected}
                                    >
                                        <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                                            {renderHL(clean, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

const CatSearch = styled.input`
  height: 38px; width: 100%; border-radius: 10px; padding: 0 12px; margin-bottom: 10px;
  border:1px solid ${UI.color.line}; background:#fff; font-weight:400; letter-spacing: -0.02em;
`;

const GridCat = styled.div`
  display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:8px;
  @media (max-width: 720px){ grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const CatBtn = styled(CountChip)<{ $on?: boolean }>`
    width: 100%;
    height: 38px;
    border-radius: 12px;
    font-size: 14px;
    letter-spacing: -0.02em;
`;

const SheetFooter = styled.div`
  position: sticky; bottom: 0;
  display:flex; justify-content:flex-end; gap:10px;
  padding: 12px var(--sheet-pad-x); 
  background: linear-gradient(180deg, rgba(255,255,255,.85), #fff 60%);
  border-top: 1px solid ${UI.color.line};
`;

const Ghost = styled.button`
    height: 35px;
    padding: 0 16px;
    border-radius: 5px;
    font-weight: 700;
    background: #fff;
    color: ${UI.color.primaryStrong};
    border: 1px solid ${UI.color.primaryStrong};
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease, border-color .15s ease, transform .08s ease;

    &:hover { background: ${UI.color.indigo50}; }        /* 은은한 파란 톤 배경 */
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(62,99,224,.25); }
    &:disabled { opacity: .6; cursor: not-allowed; }
`;

const Primary = styled.button`
    height: 35px;
    padding: 0 18px;
    border-radius: 5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: ${UI.color.primary};                      /* 솔리드 파랑 */
    border: 1px solid ${UI.color.primary};
    color: #fff;
    cursor: pointer;
    box-shadow: none;

    transition: filter .15s ease, transform .08s ease;
    &:hover { filter: brightness(0.96); }
    &:active { transform: translateY(1px); }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(79,118,241,.25); }
    &:disabled { opacity: .7; cursor: not-allowed; }
`;

// 타입
type CategoryRow = {
    id: number;
    type: string;
    group_name: string;
    name: string;
    depth: number;
    sort_order: number;
    parent_id: number | null;
};

function groupByGroupName(rows: CategoryRow[] | any): CategoryGroup[] {
    if (!Array.isArray(rows)) return [];
    const filtered = rows.filter(
        (r: CategoryRow) =>
            (r.type === "직무 중심" || r.type === "언어 중심") &&
            (r.depth === 1 || r.depth === 2)
    );

    // 그룹/정렬
    filtered.sort((a, b) =>
        a.group_name.localeCompare(b.group_name, "ko") ||
        a.depth - b.depth ||
        a.sort_order - b.sort_order ||
        a.name.localeCompare(b.name, "ko")
    );

    const map = new Map<string, CategoryGroup>();
    for (const r of filtered) {
        if (!map.has(r.group_name)) {
            map.set(r.group_name, { group: r.group_name, options: [] });
        }
        map.get(r.group_name)!.options.push({
            id: r.id,
            label: r.depth === 2 ? `• ${r.name}` : r.name, // depth=2는 점으로 들여쓰기
            depth: r.depth,
        });
    }
    return Array.from(map.values());
}

const DDGroupHeader = styled.div`
  padding: 8px 12px 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${UI.color.muted};
  background: #fafafa;
  position: sticky; top: 0; /* 스크롤 시 상단 고정 느낌 */
  z-index: 1;
`;

type GroupedCategorySelectProps = {
    value: number | null;
    onChange: (v: number | null) => void;
    groups: CategoryGroup[];
    placeholder?: string;
    allowClear?: boolean;
};

type FlatItem =
    | { kind: "header"; key: string; label: string }
    | { kind: "option"; key: string; id: number | null; label: string };

const GroupedCategorySelect: React.FC<GroupedCategorySelectProps> = ({
                                                                         value, onChange, groups, placeholder = "카테고리 선택", allowClear = true
                                                                     }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [hover, setHover] = React.useState<number>(-1);
    const ref = React.useRef<HTMLDivElement | null>(null);

    // 섀도우/스크롤
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [topShadow, setTopShadow] = React.useState(false);
    const [botShadow, setBotShadow] = React.useState(false);
    const updateShadows = React.useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setTopShadow(el.scrollTop > 0);
        setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);
    React.useEffect(() => {
        if (!open) return;
        requestAnimationFrame(updateShadows);
    }, [open, groups.length, q, updateShadows]);

    // 선택 라벨
    const selectedLabel = React.useMemo(() => {
        for (const g of groups) {
            const f = g.options.find(o => o.id === value);
            if (f) return f.label.replace(/^•\s*/, ""); // 표시용으로 점 제거
        }
        return "";
    }, [value, groups]);

    // 검색 + 플랫 리스트 (헤더는 선택 불가, 옵션만 선택)
    const flat: FlatItem[] = React.useMemo(() => {
        const out: FlatItem[] = [];
        const query = q.trim().toLowerCase();

        if (allowClear && value != null) {
            out.push({ kind: "option", key: "__clear__", id: null, label: "선택 해제" });
        }

        for (const g of groups) {
            const opts = query
                ? g.options.filter(o =>
                    (g.group + " " + o.label).toLowerCase().includes(query)
                )
                : g.options;

            if (opts.length === 0) continue;

            out.push({ kind: "header", key: `h:${g.group}`, label: g.group });
            for (const o of opts) {
                out.push({ kind: "option", key: `o:${o.id}`, id: o.id, label: o.label });
            }
        }
        return out;
    }, [groups, q, value, allowClear]);

    // 바깥 클릭/ESC로 닫기
    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
    }, []);

    // 키보드 이동: header는 건너뛰고 option에서만 선택
    const moveHover = (dir: 1 | -1) => {
        if (flat.length === 0) return;
        let i = hover;
        do {
            i = (i + dir + flat.length) % flat.length;
        } while (flat[i]?.kind === "header" && i !== hover);
        setHover(i);
    };

    const pick = (idx: number) => {
        const it = flat[idx];
        if (!it || it.kind !== "option") return;
        onChange(it.id);        // null 이면 선택 해제
        setOpen(false);
        setQ("");
        setHover(-1);
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); moveHover(1); }
        if (e.key === "ArrowUp")   { e.preventDefault(); moveHover(-1); }
        if (e.key === "Enter")     { e.preventDefault(); pick(hover >= 0 ? hover : flat.findIndex(f => f.kind === "option")); }
    };

    return (
        <DDWrap ref={ref}>
            <DDTrigger
                $hasValue={!!selectedLabel}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selectedLabel || placeholder}
            </DDTrigger>

            {/* 원클릭 선택 해제 */}
            {(allowClear && !!selectedLabel && !open) && (
                <DDClear aria-label="선택 해제" onClick={(e) => { e.stopPropagation(); onChange(null); }}>
                    ×
                </DDClear>
            )}

            <DDCaret aria-hidden $open={open}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </DDCaret>

            {open && (
                <DDPanel role="listbox" aria-label="카테고리 선택">
                    <DDSearchWrap>
                        <DDSearchIcon aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </DDSearchIcon>
                        <DDSearch
                            autoFocus
                            placeholder="카테고리/그룹 검색…"
                            value={q}
                            onChange={(e)=>{ setQ(e.target.value); setHover(0); }}
                        />
                    </DDSearchWrap>

                    <DDListWrap $top={topShadow} $bot={botShadow}>
                        <DDList ref={listRef} onScroll={updateShadows}>
                            {flat.length === 0 ? (
                                <DDEmpty>
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                    결과가 없어요.
                                </DDEmpty>
                            ) : flat.map((it, i) => {
                                if (it.kind === "header") {
                                    return <DDGroupHeader key={it.key}>{it.label}</DDGroupHeader>;
                                }
                                const selected = it.id != null && it.id === value;
                                const depth2 = it.label.startsWith("• ");
                                const clean = depth2 ? it.label.replace(/^•\s*/, "") : it.label;
                                return (
                                    <DDItem
                                        key={it.key}
                                        $active={i===hover}
                                        $selected={selected}
                                        $depth2={depth2}
                                        onMouseEnter={()=>setHover(i)}
                                        onClick={()=> pick(i)}
                                        aria-selected={selected}
                                    >
                                        <span style={{
                                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
                                        }}>
                                            {renderHL(clean, q)}
                                        </span>
                                        {selected ? <DDCheck/> : <span/>}
                                    </DDItem>
                                );
                            })}
                        </DDList>
                    </DDListWrap>
                </DDPanel>
            )}
        </DDWrap>
    );
};

type CategoryOption = { id: number; label: string; depth?: number };
type CategoryGroup = { group: string; options: CategoryOption[] };

export default function WordbookFolderPage() {
    const { folderId } = useParams<{ folderId: string }>();
    const navigate = useNavigate();
    const location = useLocation() as any;
    const [searchParams] = useSearchParams();
    const navType = useNavigationType();

    const [folderName, setFolderName] = React.useState<string>(
        location.state?.folderName ?? "내 스푼노트"
    );

    const [items, setItems] = React.useState<TermItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") ?? 0) || 0);
    const [size, setSize] = React.useState<number>(Number(searchParams.get("size") ?? 20 ) || 20);
    const [total, setTotal] = React.useState<number>(0); // 전체 개수(서버 totalItems)

    /** 선택 상태 (항상 노출되는 체크 기반) */
    const [checked, setChecked] = React.useState<Record<string, boolean>>({});
    const allOn =
        items.length > 0 &&
        Object.values(checked).length === items.length &&
        Object.values(checked).every(Boolean);

    // 전체 보기 모드(마스터 스위치)
    const [titleMode, setTitleMode] = React.useState<ViewMode>("inherit");
    const [descMode, setDescMode] = React.useState<ViewMode>("inherit");

    // 카드별 보기 상태 : 카드별로 '제목(t)'과 '뜻(d)'을 각각 show/hide/undefined로 보관
    type CardOverrides = { t?: "hide" | "show"; d?: "hide" | "show" };
    const [cardView, setCardView] = React.useState<Record<string, CardOverrides>>({});

    // 카드별 암기 상태
    const [learn, setLearn] = React.useState<Record<string, "unmemorized" | "memorized">>({});

    // ===== 정렬 상태 =====
    type SortKey = "createdAt_desc" | "title_asc" | "title_desc" | "status_asc" | "status_desc";
    const [, setSortMenuOpen] = React.useState(false);
    const [sortKey, setSortKey] = React.useState<SortKey>("createdAt_desc");

    // 인라인 정렬 팝업 상태/레퍼런스
    const [sortInlineOpen, setSortInlineOpen] = React.useState(false);
    const inlineSortRef = React.useRef<HTMLSpanElement | null>(null);

    const sortToServer = (k: SortKey): string => {
        switch (k) {
            case "title_asc":  return "title,ASC";
            case "title_desc": return "title,DESC";
            // case "status_asc": return "memorization,ASC";   // 서버에 이런 필드가 없다면 createdAt로 대체
            // case "status_desc":return "memorization,DESC";  // ↑ 없다면 제거하거나 createdAt로 매핑
            case "status_asc":
            case "status_desc":
            case "createdAt_desc":
            default:           return "createdAt,desc";
        }
    };

    // 현재 정렬 라벨
    const sortLabel = React.useMemo(() => {
        switch (sortKey) {
            case "title_asc":  return "제목순";
            case "title_desc": return "제목역순";
            case "status_asc": return "상태: 미암기→완료";
            case "status_desc":return "상태: 완료→미암기";
            case "createdAt_desc":
            default:           return "최신 등록순";
        }
    }, [sortKey]);

    // 저장/내보내기 진행 상태
    const [saving, setSaving] = React.useState<Record<string, boolean>>({});
    const [exporting, setExporting] = React.useState(false);

    // 설정 메뉴
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [, setPdfMenuOpen] = React.useState(false);
    const actionsRef = React.useRef<HTMLDivElement | null>(null);

    // 이동 모달
    const [moveOpen, setMoveOpen] = React.useState(false);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);

    // 전역 선택 바구니: termId 기준(페이지 넘어가도 유지)
    const [selectedTermIds, setSelectedTermIds] = React.useState<Set<number>>(new Set());
    const [uwtToTerm, setUwtToTerm] = React.useState<Record<string, number | null>>({});
    const storageKey = React.useMemo(() => `wb:${folderId}:selectedTermIds`, [folderId]);

    // 선택 바구니 복원
    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) setSelectedTermIds(new Set(JSON.parse(raw)));
        } catch {}
    }, [storageKey]);

    const persistSelected = React.useCallback((next: Set<number>) => {
        setSelectedTermIds(next);
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {}
    }, [storageKey]);

    const mapRow = (row: TermRow): TermItem | null => {
        const uwt =
            row.userWordbookTermId ??
            row.userTermId ??
            row.uwtId ??
            row.id ??
            row.user_wordbook_term_id;
        if (uwt == null) return null;

        let tId: number | null = row?.term?.id ?? row?.term_id ?? null;
        if (tId == null) {
            const rootTermId = row.termId ?? row.tid ?? row?.term?.termId;
            if (rootTermId != null && String(rootTermId) !== String(uwt)) {
                tId = Number(rootTermId);
                if (!Number.isFinite(tId)) tId = null;
            }
        }

        const title = row.word ?? row.title ?? row.term?.title ?? row.term?.word ?? "(제목 없음)";
        const description =
            row.description ?? row.term?.description ?? row.explain ?? row.meaning ?? "";
        const createdAt = row.createdAt ?? row.created_at;
        const tags: string[] = row.tags ?? row.term?.tags ?? [];

        return {
            uwtId: String(uwt),
            termId: tId != null ? String(tId) : null,
            title: String(title),
            description: String(description),
            createdAt,
            tags,
        };
    };

    const fetchPage = React.useCallback(
        async (p: number, pageSize: number, sortKeyNow: SortKey) => {
            if (!folderId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await http.get(`/me/folders/${folderId}/terms`, {
                    params: { page: p, perPage: pageSize, sort: sortToServer(sortKeyNow) },
                    headers: { ...authHeader() },
                    withCredentials: true,
                });
                const d = res.data ?? {};
                const raw: any[] = d.userWordbookTermList || d.items || d.content || d.terms || d.data || [];
                const list = raw.map(mapRow).filter(Boolean) as TermItem[];

                // 페이지 교체 방식
                setItems(list);

                // total / totalPages 파싱
                const nextTotal =
                    (typeof d.totalItems === "number" && d.totalItems) ||
                    (typeof d.total === "number" && d.total) ||
                    (typeof d.totalElements === "number" && d.totalElements) ||
                    0;
                setTotal(nextTotal);

                if (typeof d.folderName === "string" && d.folderName.trim())
                    setFolderName(d.folderName);
            } catch (err: any) {
                const s = err?.response?.status;
                console.error("server error body:", err?.response?.data);
                if (s === 401) { goToAccountLogin(location.pathname + location.search); return; }
                else if (s === 404 || s === 403) setError("폴더를 찾을 수 없습니다.");
                else setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        },
        [folderId, navigate]
    );

    // 페이지 바뀔 때 URL 업데이트 + 스크롤 상단
    const syncUrl = React.useCallback((p: number, s: number, sk: SortKey) => {
        const sp = new URLSearchParams(location.search);
        sp.set("page", String(p));
        sp.set("size", String(s));
        sp.set("sort", sortToServer(sk)); // 백업용, 필요 없으면 제거
        navigate({ search: `?${sp.toString()}` }, { replace: false });
    }, [location.search, navigate]);

    const handlePageChange = (nextZeroBased: number) => {
        setPage(nextZeroBased);
        syncUrl(nextZeroBased, size, sortKey);
        // 새 페이지 데이터
        fetchPage(nextZeroBased, size, sortKey);
        // 접근성/UX: 맨 위로
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };

    // 초기 진입/뒤로가기(POP) 시 복원
    React.useEffect(() => {
        // URL → 상태 반영
        const p = Number(searchParams.get("page") ?? 0) || 0;
        const s = Number(searchParams.get("size") ?? 20) || 20;
        setPage(p);
        setSize(s);

        // 데이터 로드
        fetchPage(p, s, sortKey);
        // count도 갱신
        refreshCount();
        // POP으로 돌아온 경우 스크롤 복원은 필요하면 sessionStorage로 별도 구현
        if (navType !== "POP") requestAnimationFrame(() => window.scrollTo(0, 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderId, searchParams]);

    // items 들어올 때 uwtId→termId 매핑 갱신 및 체크 동기화
    React.useEffect(() => {
        if (!items.length) return;
        setUwtToTerm((prev) => {
            const next = { ...prev };
            for (const it of items) next[it.uwtId] = it.termId ? Number(it.termId) : null;
            return next;
        });

        setChecked((prev) => {
            const next: Record<string, boolean> = { ...prev };
            for (const it of items) {
                const idNum = Number(it.termId);
                next[it.uwtId] =
                    Number.isFinite(idNum) && idNum > 0 ? selectedTermIds.has(idNum) : !!prev[it.uwtId];
            }
            return next;
        });
    }, [items, selectedTermIds]);

    // 암기 상태 초기 동기화
    React.useEffect(() => {
        if (items.length === 0) return;
        let aborted = false;
        const ids = Array.from(new Set(items.map((it) => Number(it.termId)).filter(Boolean)));

        (async () => {
            try {
                const map = await fetchMemorizationStatuses(ids);
                if (aborted || !map) return;
                setLearn((prev) => {
                    const next = { ...prev };
                    for (const it of items) {
                        const raw = map[String(it.termId)];
                        if (raw === "MEMORIZED") next[it.uwtId] = "memorized";
                        else if (raw === "LEARNING") next[it.uwtId] = "unmemorized";
                    }
                    return next;
                });
            } catch (e) {
                console.warn("[memo:init] 상태 조회 실패", e);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [items]);

    /* ------ selection / bulk actions ------ */
    const onToggleItem = (uwtId: string) => {
        const currentlyOn = !!checked[uwtId];
        setChecked((prev) => ({ ...prev, [uwtId]: !currentlyOn }));

        const termId = uwtToTerm[uwtId];
        if (Number.isFinite(termId) && (termId as number) > 0) {
            const next = new Set(selectedTermIds);
            if (currentlyOn) next.delete(termId as number);
            else next.add(termId as number);
            persistSelected(next);
        }
    };

    const toggleAll = (on: boolean) => {
        const nextChecked: Record<string, boolean> = {};
        const nextSelected = new Set(selectedTermIds);
        if (on) {
            items.forEach((it) => {
                nextChecked[it.uwtId] = true;
                const id = Number(it.termId);
                if (Number.isFinite(id) && id > 0) nextSelected.add(id);
            });
        } else {
            items.forEach((it) => {
                nextChecked[it.uwtId] = false;
                const id = Number(it.termId);
                if (Number.isFinite(id) && id > 0) nextSelected.delete(id);
            });
        }
        setChecked(nextChecked);
        persistSelected(nextSelected);
    };

    const clearAllSelected = () => {
        persistSelected(new Set());
        setChecked({});
    };

    const openMove = async () => {
        const selectedCount = selectedTermIds.size;
        if (selectedCount === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        try {
            const list = await fetchUserFolders();
            setNotebooks(list);
        } catch {
            setNotebooks([]);
        }
        setMoveOpen(true);
        setMenuOpen(false);
        setPdfMenuOpen(false);
        setSortMenuOpen(false);
    };

    // 이동 완료 핸들러
    const handleConfirmMove = async (destFolderId: string) => {
        if (!folderId) return;
        const termIds = Array.from(selectedTermIds);
        if (termIds.length === 0) {
            setMoveOpen(false);
            return;
        }

        try {
            const res = await moveFolderTerms(Number(folderId), {
                targetFolderId: Number(destFolderId),
                termIds,
            });

            const moved = new Set((res.movedTermIds ?? []).map(String));
            if (moved.size > 0) {
                // 리스트에서 제거
                setItems((prev) => prev.filter((it) => !moved.has(String(it.termId))));
                // 카운트 즉시 반영
                setCount((c) => Math.max(0, (c ?? 0) - moved.size));
            }

            setPage(0);
            syncUrl(0, size, sortKey);
            await fetchPage(0, size, sortKey);
            clearAllSelected();

            // 혹시 서버측 후처리 지연 대비 안전 리프레시
            refreshCount();
        } catch (err: any) {
            const s = err?.response?.status;
            if (s === 401) {
                alert("로그인이 필요합니다.");
                goToAccountLogin(location.pathname + location.search);
            }
            else if (s === 403) alert("해당 폴더 접근 권한이 없습니다.");
            else if (s === 404) alert("대상/소스 폴더를 찾을 수 없습니다.");
            else alert("이동 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
            console.error("[moveFolderTerms] failed:", err);
        } finally {
            setMoveOpen(false);
        }
    };

    // 서버 카운트 상태
    const [count, setCount] = React.useState<number | null>(null);
    const fmt = (n: number) => n.toLocaleString();

    // 카운트 새로고침 함수
    const refreshCount = React.useCallback(async () => {
        if (!folderId) return;

        const parseCount = (data: any) => {
            // 다양한 스키마 대응
            if (typeof data === "number") return data;
            if (data == null) return 0;
            const keys = ["count", "termsCount", "totalCount", "total", "size", "value"];
            for (const k of keys) {
                const v = (data as any)[k];
                if (typeof v === "number") return v;
                if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
            }
            // text/plain인 경우
            if (typeof data === "string" && data.trim() && !Number.isNaN(Number(data))) {
                return Number(data);
            }
            return 0;
        };

        const tryFetch = async (url: string) => {
            return http.get(url, {
                headers: { ...authHeader() },
                withCredentials: true,
                validateStatus: () => true,
            });
        };

        try {
            let res = await tryFetch(`/me/folders/${folderId}/terms/count`);
            if (res.status === 404 || res.status === 405) {
                // 클래스 레벨이 /api인 경우 대비
                res = await tryFetch(`/api/me/folders/${folderId}/terms/count`);
            }

            if (res.status === 200) {
                const value = parseCount(res.data);
                setCount(Number.isFinite(value) ? value : 0);
                return;
            }

            // 인증 실패 시 null 유지 → 상단에 …개로 표시됨
            if (res.status === 401) {
                console.warn("[count] 401", res.data);
                setCount(null);
                return;
            }

            // 권한/미존재는 0으로 표기
            if (res.status === 403 || res.status === 404) {
                console.warn("[count] ", res.status, res.data);
                setCount(0);
                return;
            }

            console.warn("[count] unexpected", res.status, res.data);
            setCount(null);
        } catch (err: any) {
            console.warn("[count] fetch error", err?.response?.status, err?.response?.data);
            setCount(null);
        }
    }, [folderId]);


    // 폴더 바뀌면 카운트/리스트 동시 초기화
    React.useEffect(() => {
        setPage(0);
        setChecked({});
        refreshCount();
    }, [folderId]);

    /* ------ PDF 내보내기 ------ */
    const exportByTermIds = async (termIds: number[], title: string) => {
        if (!termIds.length) {
            alert("선택한 단어가 없습니다.");
            return;
        }
        try {
            setExporting(true);
            const { blob, meta } = await generatePdfByTermIds({ termIds, title });
            if ((meta as any)?.mismatch) console.warn("[PDF Export] filename mismatch", meta);
            const preferred =
                (meta as any)?.cdFilename ||
                (meta as any)?.ebookFilename ||
                `jobspoon_terms_${Date.now()}.pdf`;
            const finalName = sanitizeFilename(preferred, `jobspoon_terms_${Date.now()}.pdf`);
            saveBlob(blob, finalName);
        } catch (e: any) {
            console.error("[PDF] export failed", e);
            alert(e?.message ?? "PDF 생성에 실패했습니다.");
        } finally {
            setExporting(false);
            setMenuOpen(false);
            setPdfMenuOpen(false);
            setSortMenuOpen(false);
        }
    };

    const generatePdfByFolder = React.useCallback(
        async (folderIdNum: number, title: string) => {
            const body = {
                folderId: folderIdNum,
                userFolderId: folderIdNum,
                userWordbookFolderId: folderIdNum,
                title,
            };

            const call = async (url: string) => {
                try {
                    const res = await http.post(url, body, {
                        headers: { ...authHeader() },
                        responseType: "blob",
                        validateStatus: () => true,
                    });

                    if (res.status >= 200 && res.status < 300) {
                        const headers = (res as any).headers || {};
                        const ebookFilename = headers["ebook-filename"] || headers["Ebook-Filename"];
                        let filename = ebookFilename || `jobspoon_terms_${Date.now()}.pdf`;

                        const cd = headers["content-disposition"] || headers["Content-Disposition"];
                        if (!ebookFilename && typeof cd === "string") {
                            const m = cd.match(/filename\*?=UTF-8''([^;]+)|filename="([^"]+)"/i);
                            const enc = m?.[1] ? decodeURIComponent(m[1]) : m?.[2] || "";
                            if (enc) filename = sanitizeFilename(enc, filename);
                        }

                        return { ok: true as const, blob: res.data as Blob, filename };
                    }

                    let serverMsg = `HTTP ${res.status}`;
                    try {
                        const text = await (res.data as Blob).text();
                        if (text) serverMsg = `${serverMsg} • ${text}`;
                    } catch {}
                    return { ok: false as const, status: res.status, message: serverMsg };
                } catch (e: any) {
                    return { ok: false as const, status: 0, message: e?.message ?? "요청 실패" };
                }
            };

            let result = await call(`/pdf/generate/by-folder`);
            if (!result.ok && result.status === 404) {
                result = await call(`/api/pdf/generate/by-folder`);
            }

            if (!result.ok) {
                if (result.status === 404) {
                    alert("폴더를 찾을 수 없거나 접근 권한이 없습니다.\n(서버 메시지) " + result.message);
                } else if (result.status === 401) {
                    alert("로그인이 필요합니다.");
                    goToAccountLogin(location.pathname + location.search);
                } else {
                    alert("PDF 생성에 실패했습니다.\n" + result.message);
                }
                throw new Error(result.message);
            }

            return { blob: result.blob, filename: result.filename };
        },
        [navigate, location.pathname]
    );

    const handleExportSelectedPdf = async () => {
        const picked = Array.from(selectedTermIds);
        await exportByTermIds(picked, folderName);
    };

    const handleExportWholeFolderPdf = async () => {
        if (!folderId) return;
        try {
            setExporting(true);
            const { blob, filename } = await generatePdfByFolder(Number(folderId), folderName);
            saveBlob(blob, filename);
        } catch {
        } finally {
            setExporting(false);
            setMenuOpen(false);
            setPdfMenuOpen(false);
            setSortMenuOpen(false);
        }
    };

    /* ------ settings & inline-sort : outside click/esc ------ */
    React.useEffect(() => {
        if (!menuOpen && !sortInlineOpen) return;

        const onDocClick = (e: MouseEvent) => {
            const t = e.target as Node;
            const inActions = actionsRef.current?.contains(t);
            const inInline  = inlineSortRef.current?.contains(t);
            if (!inActions && !inInline) {
                setMenuOpen(false);
                setPdfMenuOpen(false);
                setSortMenuOpen(false);
                setSortInlineOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setPdfMenuOpen(false);
                setSortMenuOpen(false);
                setSortInlineOpen(false);
            }
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [menuOpen, sortInlineOpen]);

    const cycleTitleMode = () =>
        setTitleMode((m) => (m === "allHidden" ? "inherit" : "allHidden"));

    const cycleDescMode = () =>
        setDescMode((m) => (m === "allHidden" ? "inherit" : "allHidden"));

    const handleDeleteSelected = () => {
        if (selectedTermIds.size === 0) {
            alert("먼저 단어를 선택해 주세요.");
            return;
        }
        if (!confirm(`선택된 ${selectedTermIds.size.toLocaleString()}개 단어를 삭제할까요?`)) return;
        setItems((prev) => prev.filter((it) => !selectedTermIds.has(Number(it.termId))));
        clearAllSelected();
        setMenuOpen(false);
        setPdfMenuOpen(false);
        setSortMenuOpen(false);
    };

    // ===== 표시 목록(정렬 적용) — 훅은 항상 호출되도록 return보다 위! =====
    const displayItems = React.useMemo(() => {
        const arr = [...items];
        const byTitle = (a: TermItem, b: TermItem) =>
            a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
        const statusRank = (id: string) => ((learn[id] ?? "unmemorized") === "memorized" ? 1 : 0);

        switch (sortKey) {
            case "title_asc":
                arr.sort(byTitle);
                break;
            case "title_desc":
                arr.sort((a, b) => -byTitle(a, b));
                break;
            case "status_asc":
                arr.sort((a, b) => statusRank(a.uwtId) - statusRank(b.uwtId));
                break;
            case "status_desc":
                arr.sort((a, b) => statusRank(b.uwtId) - statusRank(a.uwtId));
                break;
            case "createdAt_desc":
            default:
                arr.sort((a, b) => {
                    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
                    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
                    return tb - ta;
                });
        }
        return arr;
    }, [items, learn, sortKey]);

    const applySort = (next: SortKey) => {
        setSortKey(next);
        setMenuOpen(false);
        setSortMenuOpen(false);
        setSortInlineOpen(false);
        setPage(0);
        syncUrl(0, size, next);
        fetchPage(0, size, next);
    };

    // 퀴즈 시작
    const onStartQuiz = () => {
        const termIds = Array.from(selectedTermIds);
        const hasSelection = termIds.length > 0;
        const base = location.pathname.startsWith("/spoon-word") ? "/spoon-word" : "";
        navigate(`${base}/spoon-quiz/start`, { state: {
                source,
                folderId: source === "folder" ? Number(quizFolderId) : null,
                categoryId: source === "category" ? quizCategoryId : null,
                count: quizCount, type: quizType, level: quizLevel
            }});
    };

    // 퀴즈 설정 모달 상태
    const [quizOpen, setQuizOpen] = React.useState(false);
    type Source = "folder" | "category" | null;
    const [source, setSource] = React.useState<Source>(null);
    const [quizFolderId, setQuizFolderId] = React.useState<string>("");
    const [quizCount, setQuizCount] = React.useState<number>(5);
    type QType = "mix" | "choice" | "ox" | "initials";
    const [quizType, setQuizType] = React.useState<QType>("mix");
    type QLevel = "mix" | "hard" | "medium" | "easy";
    const [quizLevel, setQuizLevel] = React.useState<QLevel>("mix");
    const [quizErr, setQuizErr] = React.useState<string>("");
    const [quizLoading, setQuizLoading] = React.useState(false);

    const [catFetchFailed, setCatFetchFailed] = React.useState(false);

    // 모달 열릴 때 폴더 필요하면 불러오기(한 번만)
    React.useEffect(() => {
        if (!quizOpen || source !== "folder") return;
        (async () => {
            try {
                if (!notebooks.length) {
                    const list = await fetchUserFolders();
                    setNotebooks(list);
                }
            } catch {}
        })();
    }, [quizOpen, source, notebooks.length]);

    const CATEGORIES = [
        "Frontend","Backend","Database","Network","Operating System","Data Structure & Algorithm","Security","Software Engineering","DevOps / Cloud","Computer Science","AI / Data / Machine Learning","Embedded / IoT / System Programming","Java","Python","JavaScript","TypeScript","C / C++ / C#","SQL","Shell / Bash","Go(Golang)","Rust","Kotlin","Swift","Ruby","PHP","Dart","R","Julia","Assembly","Bash","PowerShell","HTML/CSS","GraphQL","Haskell, Scala, Elixir","Objective-C","Lua",
    ];

    const QuizIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path
                d="M8.5 9c.6-1.5 2.1-2.5 3.8-2.5 2.1 0 3.8 1.7 3.8 3.8 0 1.5-1 2.7-2.4 3.3-.9.4-1.3.8-1.3 1.9"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const [quizCategoryId, setQuizCategoryId] = React.useState<number | null>(null);
    const [catGroups, setCatGroups] = React.useState<CategoryGroup[]>([]);
    const extractCategoryRows = (data: any): CategoryRow[] => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    type CategoryDto = { id: number; name: string };

    async function loadCategories() {
        try {
            const roots = (await http.get<CategoryDto[]>("/categories", {
                params: { depth: 0 }, withCredentials: true,
            })).data;

            if (!roots?.length) {
                setCatGroups([]);
                setQuizErr("카테고리 데이터가 비어 있습니다.");
                setCatFetchFailed(true);
                return;
            }

            const groups = await Promise.all(
                roots.map(async (root) => {
                    const lv1 = (await http.get<CategoryDto[]>("/categories", {
                        params: { depth: 1, parentId: root.id }, withCredentials: true,
                    })).data;

                    // lv2는 병렬로
                    const lv2Bundles = await Promise.all(
                        (lv1 ?? []).map(async (c1) => {
                            const lv2 = (await http.get<CategoryDto[]>("/categories", {
                                params: { depth: 2, parentId: c1.id }, withCredentials: true,
                            })).data;
                            return { parent: c1, children: lv2 ?? [] };
                        })
                    );

                    const options: CategoryOption[] = [];
                    for (const { parent, children } of lv2Bundles) {
                        options.push({ id: parent.id, label: parent.name, depth: 1 });
                        for (const c2 of children) {
                            options.push({ id: c2.id, label: `• ${c2.name}`, depth: 2 });
                        }
                    }

                    return { group: root.name, options };
                })
            );

            setCatGroups(groups);
            setQuizErr("");
            setCatFetchFailed(false);
        } catch (e) {
            setQuizErr("카테고리를 불러오지 못했습니다.");
            setCatFetchFailed(true);
        }
    }

    React.useEffect(() => {
        if (quizOpen && source === "category" && !catFetchFailed && catGroups.length === 0) {
            loadCategories();
        }
    }, [quizOpen, source, catFetchFailed, catGroups.length]);

    function collectQuestionIds(input: any): number[] {
        if (!input) return [];

        // 문자열: JSON/CSV/단일 수 모두 시도
        if (typeof input === "string") {
            const t = input.trim();
            if (t.startsWith("{") || t.startsWith("[")) {
                try { return collectQuestionIds(JSON.parse(t)); } catch { return []; }
            }
            if (t.includes(",")) return t.split(",").map(s => Number(s.trim())).filter(Number.isFinite);
            const n = Number(t);
            return Number.isFinite(n) ? [n] : [];
        }

        // 숫자 배열
        if (Array.isArray(input) && input.every(x => Number.isFinite(x))) {
            return input.map(Number);
        }

        // 객체 배열: 자주 쓰는 키들에서 ID 추출
        if (Array.isArray(input) && input.length && typeof input[0] === "object") {
            const keys = ["id","questionId","quizQuestionId","qqId","qq_id"];
            const out = input.map((o: any) => {
                for (const k of keys) {
                    const v = o?.[k];
                    if (Number.isFinite(v)) return Number(v);
                    if (typeof v === "string" && Number.isFinite(Number(v))) return Number(v);
                }
                return null;
            }).filter((n: number | null): n is number => n != null);
            if (out.length) return out;
        }

        // 객체 컨테이너: 대표 키부터 시도
        if (input && typeof input === "object") {
            const candidates = [
                "questionIds","questionIdList","quizQuestionIds","quiz_question_ids",
                "orderedIds","orderedQuestionIds","order","list","ids","items",
                "questions","data","payload"
            ];
            for (const k of candidates) {
                const got = collectQuestionIds((input as any)[k]);
                if (got.length) return got;
            }
            // 얕은 딥스캔 (재귀)
            for (const v of Object.values(input)) {
                const got = collectQuestionIds(v);
                if (got.length) return got;
            }
        }

        return [];
    }

    function normalizeStartResponse(raw: any) {
        const root = raw?.data ?? raw ?? {};

        // 세션 ID를 다양한 자리에서 탐색 (숫자로 캐스팅 가능하면 채택)
        const firstNumber = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        };

        const sid =
            firstNumber(root.sessionId) ??
            firstNumber(root.id) ??
            firstNumber(root.session?.id) ??
            firstNumber(root.session?.sessionId) ??
            firstNumber(root.result?.sessionId) ??
            firstNumber(root.result?.session?.id) ??
            null;

        const title =
            root.title ??
            root.session?.title ??
            root.quizSet?.title ??
            root.result?.title ??
            "";

        // 문항 ID는 root 전체를 대상으로 한 번에 긁어오기 (가장 관대한 전략)
        const questionIds =
            collectQuestionIds(root) ||
            [];

        return { sessionId: sid, title, questionIds };
    }

    const basePath = React.useMemo(
        () => (location.pathname.startsWith("/spoon-word") ? "/spoon-word" : ""),
        [location.pathname]
    );

    async function fetchQuestionIdsBySession(sessionId: number | string): Promise<number[]> {
        const call = (url: string) =>
            http.get(url, {
                headers: { ...authHeader() },
                withCredentials: true,
                validateStatus: () => true,
            });

        let res = await call(`/me/quiz/sessions/${sessionId}`);
        if (res.status === 404) {
            res = await call(`/api/me/quiz/sessions/${sessionId}`);
        }

        if (res.status >= 200 && res.status < 300) {
            const norm = normalizeStartResponse(res.data);
            return Array.isArray(norm.questionIds) ? norm.questionIds : [];
        }
        throw new Error(`fetch session failed: HTTP ${res.status}`);
    }

    return (
        <NarrowLeft style={{ padding: "8px 0 24px" }}>  {/* SearchBar와 동일 폭/정렬 */}
            {/* 상단 툴바 */}
            <Toolbar>
                <ChipRow>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="이전으로"
                        style={{ border: 0, background: "transparent", cursor: "pointer" }}
                    >
                        ←
                    </button>

                    <Title>{folderName}</Title>
                    <Count>{(count ?? total).toLocaleString()}개</Count>
                    <MetaSep aria-hidden="true">|</MetaSep>
                    <SortInlineWrap ref={inlineSortRef}>
                        <SortInlineBtn
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={sortInlineOpen}
                            onClick={() => {
                                setSortInlineOpen(v => !v);
                                // 다른 메뉴는 닫기
                                setMenuOpen(false);
                                setPdfMenuOpen(false);
                                setSortMenuOpen(false);
                            }}
                        >
                            {sortLabel}
                        </SortInlineBtn>

                        {sortInlineOpen && (
                            <SortPopup role="menu" aria-label="정렬하기">
                                <RadioItem $checked={sortKey === "createdAt_desc"} onClick={() => applySort("createdAt_desc")}>
                                    <span /> 최신 등록순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "title_asc"} onClick={() => applySort("title_asc")}>
                                    <span /> 제목순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "title_desc"} onClick={() => applySort("title_desc")}>
                                    <span /> 제목역순
                                </RadioItem>
                                <RadioItem $checked={sortKey === "status_asc"} onClick={() => applySort("status_asc")}>
                                    <span /> 상태: 미암기 → 완료
                                </RadioItem>
                                <RadioItem $checked={sortKey === "status_desc"} onClick={() => applySort("status_desc")}>
                                    <span /> 상태: 완료 → 미암기
                                </RadioItem>
                            </SortPopup>
                        )}
                    </SortInlineWrap>

                    <Count>
                        {selectedTermIds.size > 0 ? ` · 선택 ${fmt(selectedTermIds.size)}` : ""}
                    </Count>

                    <Spacer />

                    <QuizCta onClick={() => setQuizOpen(true)}>
                        <PlusDot />
                        <span>나만의 스푼퀴즈 시작!</span>
                    </QuizCta>
                </ChipRow>
            </Toolbar>

            {/* ---------- Render pretty modal ---------- */}
            {quizOpen && (
                <>
                    <Scrim onClick={() => setQuizOpen(false)} />
                    <Sheet role="dialog" aria-modal="true" aria-labelledby="quiz-setup-title">
                        <SheetHeader>
                            {/*<IconBox aria-hidden>
                                <QuizIcon />
                            </IconBox>*/}
                            <TitleWrap>
                                <h3 id="quiz-setup-title">나만의 스푼퀴즈 만들기</h3>
                                <small>원하는 문제 출처와 문제 수, 문제 유형, 난이도를 골라 나에게 맞는 퀴즈를 풀어보세요</small>
                            </TitleWrap>
                            <CloseX aria-label="닫기" onClick={() => setQuizOpen(false)}>✕</CloseX>
                        </SheetHeader>

                        <SheetBody>

                            {/* 문제 고르기 */}
                            <Section>
                                <h4>문제 고르기</h4>
                                <Cards2>
                                    <OptionCard
                                        $on={source === "folder"}
                                        onClick={() => {
                                            setSource("folder");
                                            setQuizCategoryId(null);
                                        }}
                                    >
                                        <IconBox aria-hidden>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h3.6c.6 0 1.1.3 1.4.7l.9 1.1c.3.4.8.7 1.4.7H18.5A2.5 2.5 0 0 1 21 9v7.5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z"/></svg>
                                        </IconBox>
                                        <div>
                                            <h5>내 스푼노트에서 만들기</h5>
                                            <p>내 폴더의 단어들로 퀴즈를 생성해요</p>
                                        </div>
                                    </OptionCard>

                                    <OptionCard
                                        $on={source === "category"}
                                        onClick={() => {
                                            setSource("category");
                                            setQuizFolderId("");
                                            setQuizCategoryId(null);
                                        }}
                                        disabled={catFetchFailed}
                                        style={catFetchFailed ? { opacity:.6, cursor:"not-allowed" } : undefined}
                                    >
                                        <IconBox aria-hidden>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 3h12a2 2 0 0 1 2 2v3H4V5a2 2 0 0 1 2-2Zm-2 8h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z"/>
                                            </svg>
                                        </IconBox>
                                        <div>
                                            <h5>카테고리에서 만들기</h5>
                                            <p>{catFetchFailed ? "지금은 불러올 수 없어요 (서버 오류)" : "주제/언어별로 골라 빠르게 시작해요"}</p>
                                        </div>
                                    </OptionCard>
                                </Cards2>

                                {source === "folder" && (
                                    <div style={{ marginTop: 12 }}>
                                        <FolderSelect
                                            value={quizFolderId}
                                            onChange={setQuizFolderId}
                                            options={notebooks}
                                            placeholder="내 스푼노트 폴더 선택"
                                        />
                                    </div>
                                )}
                                {quizErr && (
                                    <div role="alert" style={{marginTop:8, color:"#ef4444", fontSize:13}}>
                                        {quizErr}
                                    </div>
                                )}

                                {/* 카테고리에서 만들기 UI */}
                                {source === "category" && (
                                    <div style={{ marginTop: 12 }}>
                                        <GroupedCategorySelect
                                            value={quizCategoryId}
                                            onChange={setQuizCategoryId}
                                            groups={catGroups}
                                            placeholder="카테고리 선택"
                                            allowClear
                                        />
                                    </div>
                                )}

                            </Section>

                            {/* 문항 수 */}
                            <Section>
                                <h4>문항 수</h4>
                                <ChipRow>
                                    {[5,10,15,20].map(n=>(
                                        <CountChip key={n} $on={quizCount===n} onClick={()=>setQuizCount(n)}>
                                            {n}개
                                        </CountChip>
                                    ))}
                                </ChipRow>
                            </Section>

                            {/* 문제 유형 */}
                            <Section>
                                <h4>문제 유형</h4>
                                <ChipRow>
                                    <CountChip $on={quizType==="mix"} onClick={()=>setQuizType("mix")}>유형 섞기</CountChip>
                                    <CountChip $on={quizType==="choice"} onClick={()=>setQuizType("choice")}>객관식</CountChip>
                                    <CountChip $on={quizType==="ox"} onClick={()=>setQuizType("ox")}>O/X</CountChip>
                                    <CountChip $on={quizType==="initials"} onClick={()=>setQuizType("initials")}>초성</CountChip>
                                </ChipRow>
                            </Section>

                            {/* 문제 난이도 */}
                            <Section>
                                <h4>문제 난이도</h4>
                                <ChipRow>
                                    <CountChip $on={quizLevel==="mix"} onClick={()=>setQuizLevel("mix")}>난이도 섞기</CountChip>
                                    <CountChip $on={quizLevel==="easy"} onClick={()=>setQuizLevel("easy")}>쉬운 문제</CountChip>
                                    <CountChip $on={quizLevel==="medium"} onClick={()=>setQuizLevel("medium")}>보통 문제</CountChip>
                                    <CountChip $on={quizLevel==="hard"} onClick={()=>setQuizLevel("hard")}>어려운 문제</CountChip>
                                </ChipRow>
                            </Section>
                        </SheetBody>

                        <SheetFooter>
                            <Ghost onClick={()=>setQuizOpen(false)}>취소</Ghost>
                            <Primary
                                disabled={quizLoading}
                                onClick={async () => {
                                    if (!source) { setQuizErr("문제 출처를 먼저 선택해 주세요."); return; }
                                    if (source === "folder" && !quizFolderId) { setQuizErr("폴더를 선택해 주세요."); return; }
                                    if (source === "category" && !quizCategoryId) { setQuizErr("카테고리를 선택해 주세요."); return; }
                                    setQuizErr("");

                                    try {
                                        setQuizLoading(true);

                                        const payload = {
                                            source,
                                            folderId: source === "folder" ? Number(quizFolderId) : undefined,
                                            categoryId: source === "category" ? Number(quizCategoryId) : undefined,
                                            count: Number(quizCount),
                                            type: toServerType(quizType),
                                            level: toServerLevel(quizLevel),
                                            seedMode: "AUTO",
                                            fixedSeed: null,
                                        };

                                        console.log("[quiz:start] payload", payload);

                                        const started = await startQuizUnified(payload);
                                        const norm = normalizeStartResponse(started);

                                        let qids = norm.questionIds;
                                        let sid  = norm.sessionId;

                                        if ((!qids || qids.length === 0) && sid != null) {
                                            try { qids = await fetchQuestionIdsBySession(sid); } catch {}
                                        }

                                        if (!Array.isArray(qids) || qids.length === 0) {
                                            alert("세션은 생성됐지만 문항 목록을 찾지 못했어요. 서버 응답 필드를 확인해 주세요.");
                                            return;
                                        }

                                        navigate(`${basePath}/spoon-quiz/play`, {
                                            state: { sessionId: sid, title: norm.title || folderName, questionIds: qids },
                                        });
                                        setQuizOpen(false);

                                    } catch (err: any) {
                                        const status = err?.response?.status;
                                        const data = err?.response?.data;
                                        const serverText =
                                            (typeof data === "string" && data) ||
                                            data?.message || data?.error || data?.detail || "";

                                        if (status === 401) {
                                            alert("로그인이 필요합니다."); goToAccountLogin(location.pathname + location.search);
                                        } else if (status === 403 || status === 404) {
                                            alert(serverText || "요청이 거부되었거나 리소스를 찾지 못했습니다.");
                                        } else if (status === 400 && /not.*enough|부족|insufficient/i.test(serverText)) {
                                            setQuizErr("선택한 출처에 문제가 부족합니다. 문항 수를 줄이거나 다른 출처를 선택해 주세요.");
                                        } else if (status === 400 && /type|level|enum|invalid/i.test(serverText)) {
                                            setQuizErr("문제 유형/난이도 값이 서버 형식과 다릅니다. 설정을 다시 선택해 주세요.");
                                        } else {
                                            alert(serverText || "세션 생성 중 오류가 발생했어요.");
                                        }

                                        console.error("[quiz:start] failed:", { status, serverText, err });
                                    } finally {
                                        setQuizLoading(false);
                                    }
                                }}
                            >
                                {quizLoading ? "시작 중…" : "퀴즈 시작"}
                            </Primary>

                        </SheetFooter>
                    </Sheet>
                </>
            )}

            {/* 본문 */}
            {error ? (
                <p style={{ color: "red", padding: 20 }}>{error}</p>
            ) : loading && items.length === 0 ? (
                <p style={{ padding: 20 }}>⏳ 불러오는 중...</p>
            ) : items.length === 0 ? (
                <Empty>아직 담긴 용어가 없습니다.</Empty>
            ) : (
                <>
                    <Grid>
                        {displayItems.map((it) => {
                            const ov = cardView[it.uwtId] || {};

                            const titleHidden =
                                ov.t === "hide"
                                    ? true
                                    : ov.t === "show"
                                        ? false
                                        : titleMode === "allHidden"
                                            ? true
                                            : titleMode === "allShown"
                                                ? false
                                                : false;
                            const descHidden =
                                ov.d === "hide"
                                    ? true
                                    : ov.d === "show"
                                        ? false
                                        : descMode === "allHidden"
                                            ? true
                                            : descMode === "allShown"
                                                ? false
                                                : false;

                            const isChecked = !!checked[it.uwtId];
                            const status = learn[it.uwtId] ?? "unmemorized";
                            const done = status === "memorized";
                            const isSaving = !!saving[it.uwtId];

                            return (
                                <CardWrap key={it.uwtId}>
                                    <SelectToggle
                                        $on={isChecked}
                                        aria-label={isChecked ? "선택 해제" : "선택"}
                                        title={isChecked ? "선택 해제" : "선택"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleItem(it.uwtId);
                                        }}
                                    >
                                        {isChecked ? <CheckIcon /> : <Hollow />}
                                    </SelectToggle>

                                    <StatusBtn
                                        $done={done}
                                        disabled={isSaving}
                                        aria-busy={isSaving}
                                        aria-pressed={done}
                                        aria-label={
                                            done
                                                ? "암기 완료로 표시됨, 클릭하면 미암기로 전환"
                                                : "미암기로 표시됨, 클릭하면 암기 완료로 전환"
                                        }
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (isSaving) return;

                                            const prev = learn[it.uwtId] ?? "unmemorized";
                                            const nextLocal = prev === "memorized" ? "unmemorized" : "memorized";

                                            setLearn((m) => ({ ...m, [it.uwtId]: nextLocal }));
                                            setSaving((m) => ({ ...m, [it.uwtId]: true }));
                                            try {
                                                await setMemorization({
                                                    termId: it.termId ?? undefined,
                                                    userTermId: it.uwtId,
                                                    done: nextLocal === "memorized",
                                                });
                                            } catch (err: any) {
                                                setLearn((m) => ({ ...m, [it.uwtId]: prev }));
                                                const s = err?.response?.status;
                                                if (s === 401) {
                                                    alert("로그인이 필요합니다.");
                                                    goToAccountLogin(location.pathname + location.search);
                                                } else if (s === 404) {
                                                    alert("용어를 찾을 수 없습니다.");
                                                } else {
                                                    alert("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
                                                    console.error("[memorization:toggle] failed:", err);
                                                }
                                            } finally {
                                                setSaving((m) => ({ ...m, [it.uwtId]: false }));
                                            }
                                        }}
                                    >
                                        {done ? "암기 완료" : "미암기"}
                                    </StatusBtn>

                                    <HideTermCardAdd $hideTitle={titleHidden} $hideDesc={descHidden}>
                                        <TermCard
                                            id={Number(it.termId || it.uwtId)}
                                            title={it.title}
                                            description={it.description}
                                            tags={it.tags ?? []}
                                        />
                                    </HideTermCardAdd>

                                    <LearnRow aria-label="학습 모드">
                                        <LearnLabel>학습 모드</LearnLabel>
                                        <LearnSeg role="group" aria-label="학습 모드 선택">
                                            <LearnBtn
                                                $active={titleHidden}
                                                aria-pressed={titleHidden}
                                                onClick={() => {
                                                    setCardView((prev) => {
                                                        const cur = prev[it.uwtId] || {};
                                                        if (titleMode === "allHidden") {
                                                            const nextT = cur.t === "show" ? undefined : "show";
                                                            return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                        }
                                                        if (titleMode === "allShown") {
                                                            const nextT = cur.t === "hide" ? undefined : "hide";
                                                            return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                        }
                                                        const nextT = cur.t === "hide" ? undefined : "hide";
                                                        return { ...prev, [it.uwtId]: { ...cur, t: nextT } };
                                                    });
                                                }}
                                            >
                                                {titleHidden ? "단어 보이기" : "단어 숨기기"}
                                            </LearnBtn>

                                            <LearnBtn
                                                $active={descHidden}
                                                aria-pressed={descHidden}
                                                onClick={() => {
                                                    setCardView((prev) => {
                                                        const cur = prev[it.uwtId] || {};
                                                        if (descMode === "allHidden") {
                                                            const nextD = cur.d === "show" ? undefined : "show";
                                                            return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                        }
                                                        if (descMode === "allShown") {
                                                            const nextD = cur.d === "hide" ? undefined : "hide";
                                                            return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                        }
                                                        const nextD = cur.d === "hide" ? undefined : "hide";
                                                        return { ...prev, [it.uwtId]: { ...cur, d: nextD } };
                                                    });
                                                }}
                                            >
                                                {descHidden ? "뜻 보이기" : "뜻 숨기기"}
                                            </LearnBtn>
                                        </LearnSeg>
                                    </LearnRow>
                                </CardWrap>
                            );
                        })}
                    </Grid>

                    {total > 0 && (
                        <div style={{ marginTop: 16}}>
                            <Pagination page={page} size={size} total={total} onChange={handlePageChange} />
                        </div>
                    )}
                </>
            )}

            {/* 하단 Export Tray */}
            {selectedTermIds.size > 0 && (
                <Tray>
          <span>
            선택 {selectedTermIds.size.toLocaleString()}개 — 필요한 페이지를 더 불러온 뒤에도 선택은 유지돼요.
          </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={clearAllSelected}
                            style={{
                                border: `1px solid ${UI.color.line}`,
                                background: "transparent",
                                color: "#fff",
                                padding: "8px 12px",
                                borderRadius: 8,
                                fontWeight: 700,
                            }}
                        >
                            모두 해제
                        </button>
                        <button
                            onClick={handleExportSelectedPdf}
                            disabled={exporting}
                            style={{
                                border: 0,
                                background: "linear-gradient(135deg, #4F76F1 0%, #3E63E0 100%)",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 999,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                                opacity: exporting ? 0.85 : 1,
                            }}
                        >
                            {exporting ? "내보내는 중..." : "선택 항목 PDF 내보내기"}
                        </button>
                    </div>
                </Tray>
            )}

            {/* 이동 모달 */}
            <SpoonNoteModal
                open={moveOpen}
                notebooks={notebooks}
                onClose={() => setMoveOpen(false)}
                onCreate={async (name) => {
                    const { data } = await http.post("/me/folders", { folderName: name }, { headers: { ...authHeader() } });
                    const newId = String(data.id);
                    const newName = data.folderName ?? name;
                    setNotebooks((prev) => [{ id: newId, name: newName }, ...prev]);
                    return newId;
                }}
                onReorder={async (orderedIds) => {
                    try {
                        await patchReorderFolders(orderedIds);
                        const refreshed = await fetchUserFolders();
                        setNotebooks(refreshed);
                    } catch (e) {
                        console.warn("[folders reorder] 실패", e);
                    }
                }}
                onSave={handleConfirmMove}
                onGoToFolder={(fid, name) => {
                    setMoveOpen(false);
                    navigate(`/spoon-word/folders/${fid}`, { state: { folderName: name } });
                }}
                onRename={async (folderId, newName) => {
                    await renameUserFolder(folderId, newName);
                    setNotebooks((prev) => prev.map((n) => (n.id === folderId ? { ...n, name: newName } : n)));
                }}
                onRequestDelete={async (fid) => {
                    await deleteUserFolder(fid, "purge");
                    setNotebooks(await fetchUserFolders());
                }}
                onRequestBulkDelete={async (ids) => {
                    if (!confirm(`선택 ${ids.length}개 폴더 삭제? (안의 용어도 삭제)`)) return;
                    setNotebooks(await fetchUserFolders());
                }}
            />
        </NarrowLeft>
    );
}
