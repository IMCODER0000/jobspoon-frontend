{/* 신뢰점수 안내 모달 */}

import React from "react";
import styled from "styled-components";
import { TrustScoreResponse } from "../../api/dashboardApi.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    trust: TrustScoreResponse;
};

export default function TrustScoreModal({ isOpen, onClose, trust }: Props) {
    return (
        <Overlay isOpen={isOpen}>
            <Modal isOpen={isOpen}>
                <Header>
                    <h2>신뢰 점수 산정 기준</h2>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </Header>

                <Content>
                    <h3>내 점수 현황</h3>
                    <ul>
                        <li>🗓️ 출석률: {trust.attendanceScore.toFixed(1)} / 25점</li>
                        <li>🎤 모의면접: {Math.round(trust.interviewScore)} / 20점</li>
                        <li>🧩 문제풀이: {Math.round(trust.quizScore)} / 20점</li>
                        <li>✍️ 리뷰 작성: {Math.round(trust.reviewScore)} / 10점</li>
                        <li>👥 스터디룸 개설: {Math.round(trust.studyroomScore)} / 10점</li>
                        <li>💬 댓글 작성: {Math.round(trust.commentScore)} / 10점</li>
                        <li>⚡ 활성 보너스: {trust.bonusApplied ? "+5점" : "0점"}</li>
                    </ul>
                    <p><b>총점: {Math.round(trust.trustScore)} / 100점</b></p>
                </Content>

                <Footer>
                    <ConfirmButton onClick={onClose}>확인</ConfirmButton>
                </Footer>
            </Modal>
        </Overlay>
    );
}

/* ================= styled-components ================= */
const Overlay = styled.div<{ isOpen: boolean }>`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    background: ${({ isOpen }) => (isOpen ? "rgba(0,0,0,0.4)" : "transparent")};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
    transition: all 0.3s ease-in-out;
`;

const Modal = styled.div<{ isOpen: boolean }>`
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    max-height: 80vh;      /* 화면 높이 80%까지만 */
    overflow-y: auto;      /* 넘치면 스크롤 */
    display: flex;
    flex-direction: column;
    gap: 16px;

    transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
    transition: all 0.3s ease-in-out;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
    }
`;

const CloseButton = styled.button`
    font-size: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
`;

const Content = styled.div`
    font-size: 14px;
    line-height: 1.6;

    ul {
        margin: 8px 0;
        padding-left: 18px;
    }

    li {
        margin-bottom: 4px;
    }
`;

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const ConfirmButton = styled.button`
    padding: 8px 16px;
    background: rgb(59, 130, 246);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    transition: background 0.2s ease-in-out;
    &:hover {
        background: rgb(37, 99, 235);
    }
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 16px 0;
`;
