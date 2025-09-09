import React from "react";
import styled from "styled-components";
import { TrustScoreResponse } from "../api/dashboardApi.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    trust: TrustScoreResponse;
};

export default function TrustScoreModal({ isOpen, onClose, trust }: Props) {
    if (!isOpen) return null;

    return (
        <Overlay>
            <Modal>
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

                    <Divider />

                    <h3>산정 기준표</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>항목</th>
                            <th>배점(최대)</th>
                            <th>산정 방식</th>
                            <th>설명</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>출석률</td>
                            <td>25점</td>
                            <td>출석률이 높을수록 점수 상승 (100% = 25점)</td>
                            <td>성실성 지표</td>
                        </tr>
                        <tr>
                            <td>모의면접</td>
                            <td>20점</td>
                            <td>누적 참여 횟수 + 최근 한 달 활동 반영</td>
                            <td>꾸준한 실전 연습</td>
                        </tr>
                        <tr>
                            <td>문제풀이</td>
                            <td>20점</td>
                            <td>누적 풀이 수 + 최근 한 달 풀이 반영</td>
                            <td>학습 꾸준함</td>
                        </tr>
                        <tr>
                            <td>리뷰 작성</td>
                            <td>10점</td>
                            <td>작성한 리뷰 개수에 따라 점수 상승</td>
                            <td>피드백 기여</td>
                        </tr>
                        <tr>
                            <td>스터디룸 개설</td>
                            <td>10점</td>
                            <td>스터디룸 개설 시 높은 점수 반영</td>
                            <td>커뮤니티 리더십</td>
                        </tr>
                        <tr>
                            <td>댓글 작성</td>
                            <td>10점</td>
                            <td>작성한 댓글 개수에 따라 점수 상승</td>
                            <td>커뮤니티 참여</td>
                        </tr>
                        <tr>
                            <td>활성 보너스</td>
                            <td>+5점</td>
                            <td>최근 한 달 내 활동이 있으면 +5점</td>
                            <td>총점은 최대 100점</td>
                        </tr>
                        </tbody>
                    </table>
                </Content>

                <Footer>
                    <ConfirmButton onClick={onClose}>확인</ConfirmButton>
                </Footer>
            </Modal>
        </Overlay>
    );
}

/* styled-components (RankGuideModal 과 동일) */
const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
`;

const Modal = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    max-height: 80vh;      /* 🔹 화면 높이 80%까지만 */
    overflow-y: auto;      /* 🔹 넘치면 스크롤 */
    display: flex;
    flex-direction: column;
    gap: 16px;
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

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        font-size: 13px;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        text-align: left;
    }

    th {
        background: #f9fafb;
        font-weight: 600;
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

    &:hover {
        background: rgb(37, 99, 235);
    }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
`;
