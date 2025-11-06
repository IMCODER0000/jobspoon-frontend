import React from "react";
import styled, { keyframes } from "styled-components";
import { FaFolderOpen, FaPenFancy } from "react-icons/fa";

export default function MyPostsPage() {
    return (
        <Section>
            <SectionHeader>
                <SectionTitle>나의 게시물</SectionTitle>
            </SectionHeader>

            <Card>
                <CardHeader>
                    <IconBox>
                        <FaFolderOpen size={26} color="#2563eb"/>
                    </IconBox>
                    <CardTitle>JobSpoon 게시물 기록</CardTitle>
                    <Tag>COMING SOON</Tag>
                </CardHeader>

                <CardBody>
                    <p>
                        JobSpoon 곳곳에서 내가 남긴
                        <strong> 게시글, 댓글, 리뷰</strong>를 한눈에 관리할 수 있는 공간이에요.
                    </p>
                    <p>
                        수정하거나 삭제할 수 있는 관리 기능이 함께 추가될 예정입니다.
                    </p>
                    <p>
                        <strong>현재는 서비스 준비 중</strong>이며,
                        더 편리한 기능으로 곧 찾아올게요!
                    </p>
                </CardBody>

                <ComingSoonBox>
                    <FaPenFancy size={15} color="#2563eb" />
                    <span>게시물 관리 기능 준비 중</span>
                </ComingSoonBox>
            </Card>
        </Section>
    );
}

/* ================= styled-components ================= */
const fadeUp = keyframes`
  from {
    opacity: 0;
    margin-top: 16px;
  }
  to {
    opacity: 1;
    margin-top: 0;
  }
`;

const float = keyframes`
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
`;

const pulse = keyframes`
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    }
    50% {
        transform: scale(1.015); /* 살짝 커졌다가 */
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15); /* 그림자 강조 */
    }
`;

const Section = styled.section`
    animation: ${fadeUp} 0.6s ease both;
    padding: 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: #111827;
`;

const Card = styled.div`
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    animation: ${float} 4s ease-in-out infinite, ${pulse} 5s ease-in-out infinite;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
    }
`;

const CardHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
`;

const IconBox = styled.div`
    width: 52px;
    height: 52px;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #1e3a8a;
`;

const Tag = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 8px;
    padding: 3px 10px;
    letter-spacing: 0.5px;
`;

const CardBody = styled.div`
    font-size: 15px;
    line-height: 1.8;
    color: #374151;

    strong {
        font-weight: 600;
        color: #1e40af;
    }

    p + p {
        margin-top: 8px;
    }
`;

const ComingSoonBox = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(37, 99, 235, 0.06);
    color: #2563eb;
    font-size: 14px;
    font-weight: 500;
    margin-top: 20px;
    animation: ${fadeUp} 0.6s ease both;
`;
