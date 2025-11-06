import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { fetchInterviewResultList, InterviewSummary } from "../api/InterviewApi.ts";
import {FaRobot, FaRegClock, FaSearch, FaLock} from "react-icons/fa";
import Spinner from "../components/common/Spinner.tsx";
import {notifyError, notifyInfo} from "../utils/toast.ts";

export default function InterviewResultPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<InterviewSummary[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "progress">("all");
    const [sortOption, setSortOption] = useState<"latest" | "oldest" | "status">("latest");

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchInterviewResultList();

                // 최신순 정렬
                const sorted = data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setList(sorted);
            } catch (err) {
                console.error(err);
                notifyError("면접 결과 목록을 불러오지 못했습니다 ❗");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <Spinner />;

    const filteredList = list
        .filter((item) =>
            (item.interviewType ?? "").toLowerCase().includes(searchText.toLowerCase())
        )
        .filter((item) => {
            if (filterStatus === "completed") return item.finished;
            if (filterStatus === "progress") return !item.finished;
            return true;
        })
        .sort((a, b) => {
            if (sortOption === "latest")
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOption === "oldest")
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOption === "status") return Number(b.finished) - Number(a.finished);
            return 0;
        });

    return (
        <Section>
            <SectionTitle>AI 면접 결과</SectionTitle>
            <SubText>최근 진행한 모의면접 결과를 확인할 수 있어요.</SubText>

            <FilterBar>
                <LeftGroup>
                    <SearchBox>
                        <FaSearch color="#9ca3af" size={14} />
                        <SearchInput
                            type="text"
                            placeholder="면접 유형 검색..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </SearchBox>
                </LeftGroup>

                <RightGroup>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "progress")}
                    >
                        <option value="all">전체</option>
                        <option value="completed">완료</option>
                        <option value="progress">진행 중</option>
                    </Select>

                    <Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as "latest" | "oldest" | "status")}
                    >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="status">상태별</option>
                    </Select>
                    <Divider />
                    <CountText>{filteredList.length}건</CountText>
                </RightGroup>
            </FilterBar>

            {list.length === 0 ? (
                <EmptyState>
                    <FaRobot size={44} color={palette.primary} />
                    <h2>아직 진행한 AI 면접이 없어요</h2>
                    <p>AI 모의면접으로 나만의 첫 기록을 만들어보세요!</p>
                    <StartButton
                        onClick={() =>
                            (window.location.href = "/vue-ai-interview/ai-interview/landing")
                        }>
                        AI 면접 시작하기
                    </StartButton>
                </EmptyState>
            ) : filteredList.length === 0 ? (
                <EmptyState>
                    <FaSearch size={42} color={palette.accent} />
                    <h2>검색 결과가 없습니다</h2>
                    <p>입력하신 조건에 맞는 면접 결과를 찾을 수 없습니다.</p>
                    <p>다른 키워드로 검색해보세요</p>
                </EmptyState>
            ) : (
                <BaseCard>
                    {filteredList.map((item) => (
                        <InterviewRow key={item.interviewId}>
                            <LeftInfo>
                                <FaRobot size={18} color={palette.primary} />
                                <InfoText>
                                    <Topic>{item.interviewType}</Topic>
                                    <DateText>
                                        <FaRegClock size={12} color={palette.textSub} />
                                        {new Date(item.createdAt).toLocaleString("ko-KR")}
                                    </DateText>
                                </InfoText>
                            </LeftInfo>

                            <RightArea>
                                <StatusBadge isFinished={item.finished}>
                                    {item.finished ? "COMPLETED" : "IN PROGRESS"}
                                </StatusBadge>

                                {item.finished ? (
                                    <DetailButton
                                        onClick={() => {
                                            window.location.href = `/vue-ai-interview/ai-interview/result/${item.interviewId}`;
                                        }}>
                                        상세보기
                                    </DetailButton>
                                ) : (
                                    <DisabledButton
                                        onClick={() =>
                                            notifyInfo("아직 면접이 완료되지 않았습니다 ❗")
                                        }>
                                        <FaLock size={12} />
                                        진행중
                                    </DisabledButton>
                                )}
                            </RightArea>
                        </InterviewRow>
                    ))}
                </BaseCard>
            )}
        </Section>
    );
}

/* ---------- 팔레트 ---------- */
const palette = {
    primary: "#4CC4A8",
    accent: "#1B8C95",
    lightBG: "#F8FBF8",
    border: "rgba(76,196,168,0.35)",
    shadow: "rgba(76,196,168,0.22)",
    textMain: "#0F172A",
    textSub: "#64748B",
};

/* ---------- 애니메이션 ---------- */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

/* ---------- 스타일 ---------- */
const Section = styled.section`
    background: rgba(255, 255, 255, 0.75);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: ${fadeUp} 0.6s ease both;
`;

const SectionTitle = styled.h2`
    font-size: 19px;
    font-weight: 700;
    color: ${palette.textMain};
    margin-bottom: 6px;
`;

const SubText = styled.p`
    color: ${palette.textSub};
    font-size: 14px;
    margin-bottom: 18px;
`;

const FilterBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
`;

const SearchBox = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 10px;
    width: 240px;
    transition: all 0.15s ease;

    &:hover,
    &:focus-within {
        border-color: ${palette.primary};
        background: #ffffff;
        box-shadow: 0 0 0 2px rgba(76, 196, 168, 0.1);
    }

    svg {
        color: #94a3b8;
    }
`;

const SearchInput = styled.input`
    border: none;
    outline: none;
    background: transparent;
    margin-left: 8px;
    font-size: 14px;
    color: #1e293b;
    width: 100%;

    &::placeholder {
        color: #94a3b8;
    }
`;

const Select = styled.select`
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 14px;
    color: #334155;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #ffffff;
        border-color: ${palette.primary};
        box-shadow: 0 0 0 2px rgba(76, 196, 168, 0.1);
    }

    &:focus {
        outline: none;
        border-color: ${palette.primary};
    }
`;

const CountText = styled.span`
  font-size: 13px;
  color: ${palette.textSub};
`;

const Divider = styled.span`
    width: 1px;
    height: 18px;
    background: #e5e7eb;
    margin-left: 5px;
`;

const LeftGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const RightGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const BaseCard = styled.div`
    background: ${palette.lightBG};
    border-radius: 14px;
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const InterviewRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 12px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: 0.2s ease;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px ${palette.shadow};
    }
`;

const LeftInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const InfoText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Topic = styled.span`
    font-weight: 600;
    color: ${palette.textMain};
`;

const DateText = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: ${palette.textSub};
`;

const RightArea = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const StatusBadge = styled.span<{ isFinished: boolean }>`
    font-size: 12.5px;
    font-weight: 600;
    border-radius: 999px;
    padding: 5px 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;

    color: ${({ isFinished }) => (isFinished ? "#1E40AF" : "#92400E")};
    background-color: ${({ isFinished }) => (isFinished ? "#DBEAFE" : "#FEF3C7")};
    border: 1px solid ${({ isFinished }) => (isFinished ? "#BFDBFE" : "#FDE68A")};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &:hover {
        filter: brightness(0.98);
    }
`;

const DetailButton = styled.button`
    font-size: 13px;
    font-weight: 600;
    color: #1e3a8a;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(147, 197, 253, 0.5);
    border-radius: 999px;
    padding: 7px 18px;
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 2px 4px rgba(37, 99, 235, 0.15);

    &:hover {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        transform: translateY(-1px);
    }

    &:active {
        transform: scale(0.98);
        box-shadow: 0 1px 4px rgba(37, 99, 235, 0.2);
    }
`;


const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    text-align: center;
    color: ${palette.textMain};
    gap: 12px;
    h2 {
        color: ${palette.primary};
        font-weight: 700;
    }
    p {
        color: ${palette.textSub};
    }
`;

const StartButton = styled.button`
    background: linear-gradient(90deg, #3B82F6 0%, #10B981 100%);
    color: white;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 999px;
    padding: 10px 22px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(59,130,246,0.25);
    &:hover {
        transform: translateY(-2px);
        opacity: 0.95;
    }
`;

const DisabledButton = styled.button`
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    background: rgba(240, 240, 240, 0.9);
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    padding: 7px 18px;
    cursor: not-allowed;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.8;
`;
