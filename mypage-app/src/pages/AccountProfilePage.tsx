import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import defaultProfile from "../assets/default_profile.png";
import ServiceModal from "../components/modals/ServiceModal.tsx";
import TitleGuideModal from "../components/modals/TitleGuideModal.tsx";
import TrustScoreCriteriaModal from "../components/modals/TrustScoreCriteriaModal.tsx";
import { ProfileAppearanceResponse, uploadProfilePhoto } from "../api/profileAppearanceApi.ts";
import { updateNickname } from "../api/accountProfileApi.ts";
import TrustScoreHistoryGraph from "../components/history/TrustScoreHistoryGraph.tsx";
import { equipTitle, unequipTitle, UserTitleResponse } from "../api/userTitleApi.ts";
import { fetchTrustScore, TrustScoreResponse } from "../api/userTrustScoreApi.ts";
import {
    calcAttendanceScore,
    calcInterviewScore,
    calcProblemScore,
    calcPostScore,
    calcStudyroomScore,
    calcCommentScore,
    calcTotalScore
} from "../utils/trustScoreUtils";
import { notifySuccess, notifyError, notifyInfo } from "../utils/toast";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { theme } from "../styles/theme.ts";

type OutletContextType = {
    profile: ProfileAppearanceResponse | null;
    titles: UserTitleResponse[];
    refreshAll: () => Promise<void>;
};

type Status = "loading" | "empty" | "loaded";

export default function AccountProfilePage() {
    const { profile, titles, refreshAll } = useOutletContext<OutletContextType>();

    const [trustScore, setTrustScore] = useState<TrustScoreResponse | null>(null);
    const [trustStatus, setTrustStatus] = useState<Status>("loading");
    const [isTrustCriteriaOpen, setIsTrustCriteriaOpen] = useState(false);
    const [isTitleGuideOpen, setIsTitleGuideOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animatedId, setAnimatedId] = useState<number | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /** 신뢰점수 불러오기 */
    useEffect(() => {
        const loadTrust = async () => {
            try {
                const trust = await fetchTrustScore();
                setTrustScore(trust || null);
                setTrustStatus(trust ? "loaded" : "empty");
            } catch (err) {
                console.error(err);
                setTrustStatus("empty");
            }
        };
        loadTrust();
    }, []);

    /** 닉네임 수정 */
    const handleStartEdit = () => {
        if (profile) {
            setTempNickname(profile.nickname);
            setIsEditingNickname(true);
        }
    };

    const handleSaveNickname = async () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            notifyInfo("로그인이 필요합니다 🔒");
            return;
        }

        try {
            await updateNickname(tempNickname);
            await refreshAll();
            setIsEditingNickname(false);
            notifySuccess("닉네임이 성공적으로 변경되었습니다 ✨");
        } catch (err: any) {
            notifyError(err.message || "닉네임 수정 실패 ❌");
        }
    };

    const handleCancelEdit = () => {
        setTempNickname("");
        setIsEditingNickname(false);
    };

    /** 사진 업로드 */
    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            notifyInfo("로그인이 필요합니다 🔒");
            return;
        }

        try {
            setIsUploading(true);
            await uploadProfilePhoto(file);
            await refreshAll();
            notifySuccess("프로필 사진이 변경되었습니다 📸");
        } catch (err: any) {
            notifyError(err.message || "사진 업로드 실패 ❌");
        } finally {
            setIsUploading(false);
        }
    };

    /** 칭호 장착/해제 */
    const handleEquip = async (titleId: number) => {
        try {
            const target = titles.find((t) => t.id === titleId);

            if (target?.equipped) {
                await unequipTitle();
                await refreshAll();
                notifyInfo("칭호가 해제되었습니다 💤");
            } else {
                const updated = await equipTitle(titleId);
                await refreshAll();
                notifySuccess(`「${updated.displayName}」 칭호가 장착되었습니다 🎉`);

                // 🎆 Confetti 효과
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5E5CE6"]
                });

                setAnimatedId(titleId);
                setTimeout(() => setAnimatedId(null), 800);
            }
        } catch (error: any) {
            notifyError(error.message || "칭호 장착/해제 실패 ❌");
        }
    };

    if (!profile) return <p>불러오는 중...</p>;

    return (
        <Wrapper>
            {/* ================== 회원정보 ================== */}
            <Section>
                <SectionTitle>회원정보</SectionTitle>
                <InfoCard>
                    <ProfileRow>
                        {/* 왼쪽: 프로필 + 닉네임 */}
                        <ProfileLeft>
                            <PhotoWrapper>
                                {isUploading ? (
                                    <Spinner />
                                ) : (
                                    <Photo
                                        src={profile.photoUrl || defaultProfile}
                                        alt="프로필"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = defaultProfile;
                                        }}
                                        onClick={() => setIsImageModalOpen(true)} // 클릭 시 모달 열림
                                    />
                                )}
                            </PhotoWrapper>

                            <NicknameArea>
                                {isEditingNickname ? (
                                    <NicknameInput
                                        value={tempNickname}
                                        onChange={(e) => setTempNickname(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <h3>{profile.nickname}</h3>
                                )}
                            </NicknameArea>
                        </ProfileLeft>

                        {/* 오른쪽: 버튼 */}
                        <ButtonGroup>
                            {isEditingNickname ? (
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <SoftButton onClick={handleSaveNickname}>확인</SoftButton>
                                    <SoftButton onClick={handleCancelEdit}>취소</SoftButton>
                                </div>
                            ) : (
                                <SoftButton onClick={handleStartEdit}>별명 수정</SoftButton>
                            )}
                            <SoftButton onClick={handleFileClick} disabled={isUploading}>
                                {isUploading ? "업로드 중..." : "사진 변경"}
                            </SoftButton>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </ButtonGroup>
                    </ProfileRow>

                    <InfoList>
                        <InfoItem>
                            <FaEnvelope />
                            <span>{profile.email}</span>
                        </InfoItem>
                        <InfoItem>
                            <FaLock />
                            <span>가입일: -</span>
                        </InfoItem>
                    </InfoList>
                </InfoCard>
            </Section>

            {/* ================== 활동 이력 ================== */}
            <Section>
                <SectionTitle>활동 이력</SectionTitle>

                {/* 신뢰점수 */}
                <Card>
                    <HistoryHeader>
                        <HeaderLeft>
                            <Icon>🛡️</Icon>
                            <h3>활동 점수</h3>
                        </HeaderLeft>
                        <ToggleButton onClick={() => setIsTrustCriteriaOpen(true)}>
                            산정 기준
                        </ToggleButton>
                    </HistoryHeader>

                    {trustStatus === "loading" ? (
                        <Empty>불러오는 중...</Empty>
                    ) : trustStatus === "empty" ? (
                        <Empty>신뢰점수가 없습니다.</Empty>
                    ) : (
                        <>
                            <TrustContent>
                                <TrustGrid>
                                    <TrustItem>
                                        <span>출석률</span>
                                        <ProgressBar
                                            percent={(calcAttendanceScore(trustScore!.attendanceRate) / 25) * 100}
                                        />
                                        <Count>
                                            {calcAttendanceScore(trustScore!.attendanceRate).toFixed(1)} / 25점
                                        </Count>
                                    </TrustItem>
                                    <TrustItem>
                                        <span>모의면접</span>
                                        <ProgressBar
                                            percent={(calcInterviewScore(trustScore!.monthlyInterviews) / 20) * 100}
                                        />
                                        <Count>
                                            {calcInterviewScore(trustScore!.monthlyInterviews)} / 20점
                                        </Count>
                                    </TrustItem>
                                    <TrustItem>
                                        <span>문제풀이</span>
                                        <ProgressBar
                                            percent={(calcProblemScore(trustScore!.monthlyProblems) / 20) * 100}
                                        />
                                        <Count>
                                            {calcProblemScore(trustScore!.monthlyProblems)} / 20점
                                        </Count>
                                    </TrustItem>
                                    <TrustItem>
                                        <span>글 작성</span>
                                        <ProgressBar
                                            percent={(calcPostScore(trustScore!.monthlyPosts) / 15) * 100}
                                        />
                                        <Count>
                                            {calcPostScore(trustScore!.monthlyPosts)} / 15점
                                        </Count>
                                    </TrustItem>
                                    <TrustItem>
                                        <span>스터디룸</span>
                                        <ProgressBar
                                            percent={(calcStudyroomScore(trustScore!.monthlyStudyrooms) / 10) * 100}
                                        />
                                        <Count>
                                            {calcStudyroomScore(trustScore!.monthlyStudyrooms)} / 10점
                                        </Count>
                                    </TrustItem>
                                    <TrustItem>
                                        <span>댓글</span>
                                        <ProgressBar
                                            percent={(calcCommentScore(trustScore!.monthlyComments) / 15) * 100}
                                        />
                                        <Count>
                                            {calcCommentScore(trustScore!.monthlyComments)} / 15점
                                        </Count>
                                    </TrustItem>
                                </TrustGrid>
                                <Divider />
                                <TotalScore>
                                    총점: {trustScore?.totalScore?.toFixed(1) ?? "0.0"} / 100점
                                </TotalScore>
                            </TrustContent>
                        </>
                    )}
                </Card>

                {/* 활동 점수 변화 추이 */}
                <Card>
                    <HistoryHeader>
                        <HeaderLeft>
                            <Icon>📈</Icon>
                            <h3>활동 점수 변화 추이</h3>
                        </HeaderLeft>
                    </HistoryHeader>

                    <GraphNotice>
                        현재 그래프는 <strong>지난달</strong>까지의 기록이며,{" "}
                        <strong>이번달</strong> 점수는 실시간으로 반영 중입니다.
                    </GraphNotice>

                    <TrustScoreHistoryGraph />
                </Card>

                {/* 칭호 */}
                <Card>
                    <HistoryHeader>
                        <HeaderLeft>
                            <Icon>🎖️</Icon>
                            <h3>칭호 이력</h3>
                        </HeaderLeft>
                        <ToggleButton onClick={() => setIsTitleGuideOpen(true)}>
                            칭호 가이드
                        </ToggleButton>
                    </HistoryHeader>

                    {titles.length === 0 ? (
                        <Empty>획득한 칭호가 없습니다.</Empty>
                    ) : (
                        <TitleGrid>
                            {titles.map((title) => (
                                <TitleCard
                                    key={title.id}
                                    equipped={title.equipped}
                                    animate={
                                        animatedId === title.id
                                            ? { scale: [1, 1.15, 1], opacity: [1, 0.85, 1] }
                                            : {}
                                    }
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <TitleName>{title.displayName}</TitleName>
                                    <AcquiredDate>
                                        {new Date(title.acquiredAt).toLocaleDateString()}
                                    </AcquiredDate>
                                    <Description>{title.description}</Description>
                                    <ActionButton onClick={() => handleEquip(title.id)}>
                                        {title.equipped ? "해제" : "장착"}
                                    </ActionButton>
                                </TitleCard>
                            ))}
                        </TitleGrid>
                    )}
                </Card>
            </Section>

            {/* 모달 */}
            <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <TitleGuideModal isOpen={isTitleGuideOpen} onClose={() => setIsTitleGuideOpen(false)} />
            <TrustScoreCriteriaModal isOpen={isTrustCriteriaOpen} onClose={() => setIsTrustCriteriaOpen(false)} />
            {/* 프로필 이미지 확대 모달 */}
            {isImageModalOpen && (
                <ModalOverlay onClick={() => setIsImageModalOpen(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <LargeImage src={profile.photoUrl || defaultProfile} alt="profile-large" />
                    </ModalContent>
                </ModalOverlay>
            )}
        </Wrapper>
    );
}

/* ================== styled-components ================== */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.section`
    padding: ${theme.spacing.sectionPadding};
    border-radius: ${theme.radius.section};
    background: ${theme.color.bgWhite};
    box-shadow: ${theme.shadow.section};
`;

const SectionTitle = styled.h2`
    ${theme.mixin.sectionTitle}
`;

/* ---------- 회원정보 ---------- */

const InfoCard = styled.div`
    background: ${theme.color.bgWhite};
    border: 1px solid ${theme.color.border};
    border-radius: ${theme.radius.card};
    box-shadow: ${theme.shadow.card};
    padding: 32px 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
`;

const ProfileRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
`;

const ProfileLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const PhotoWrapper = styled.div`
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(145deg, #f8fbff, #eef4ff);
    border: 1.5px solid ${theme.color.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05), 0 6px 20px rgba(0, 0, 0, 0.04);    
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.25s ease;
    } 
    
    &:hover img {
        transform: scale(1.05);
    }
`;

const NicknameArea = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;

    h3 {
        font-size: 20px;
        font-weight: 700;
        color: ${theme.color.text};
    }
`;

const NicknameInput = styled.input`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.color.text};
    border: none;
    border-bottom: 2px solid ${theme.color.primary};
    outline: none;
    background: transparent;
    padding: 4px 0;
    width: 180px;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
`;

const SoftButton = styled.button`
  font-size: ${theme.font.small};
  padding: 6px 12px;
  background: white;
  border: 1px solid ${theme.color.border};
  border-radius: ${theme.radius.button};
  color: ${theme.color.textMuted};
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    border-color: ${theme.color.primary};
    color: ${theme.color.primary};
    background: rgba(59, 130, 246, 0.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
    border: 3px solid #f3f3f3;
    border-top: 3px solid ${theme.color.primary};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const Photo = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid #e5e7eb;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transform-origin: center center;
    will-change: transform, box-shadow;
    transition:
            transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
            box-shadow 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
    }
`;


const InfoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-top: 1px solid ${theme.color.border};
    padding-top: 12px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: ${theme.font.body};
    color: ${theme.color.textMuted};

    svg {
        font-size: 14px;
        color: ${theme.color.textMuted};
    }

    span {
        color: ${theme.color.text};
        font-weight: 500;
    }
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${theme.color.border};
    margin: 0;
`;

/* 인스타그램식 확대 모달 */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: transparent;
  padding: 0;
`;

const LargeImage = styled.img`
  width: 400px;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  animation: zoomIn 0.25s ease;

  @keyframes zoomIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 80vw;
    height: 80vw;
  }
`;

/* ---------- 활동 이력 (신뢰점수/레벨/칭호) ---------- */

const Card = styled.div`
  background: rgb(249, 250, 251);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: rgb(17, 24, 39);
  }

  p {
    font-size: 14px;
    color: rgb(107, 114, 128);
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Icon = styled.span`
  font-size: 18px;
`;

const ToggleButton = styled.button`
  font-size: 13px;
  color: #3b82f6;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const TrustItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
`;

const ProgressBar = styled.div<{ percent: number }>`
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ percent }) => percent}%;
    background: linear-gradient(90deg, #3b82f6, #10b981);
    transition: width 0.3s ease;
  }
`;

const Count = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgb(31, 41, 55);
`;

const TrustContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TotalScore = styled.div`
    background: rgba(59, 130, 246, 0.08);
    color: ${theme.color.primary};
    border-radius: ${theme.radius.button};
    font-weight: 700;
`;

const TitleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

// ✅ motion.div로 교체
const TitleCard = styled(motion.div)<{ equipped: boolean }>`
    border: 1px solid ${({ equipped }) => (equipped ? "#3b82f6" : "rgb(229,231,235)")};
    border-radius: 10px;
    padding: 12px;
    background: ${({ equipped }) => (equipped ? "rgba(59,130,246,0.05)" : "white")};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
        box-shadow: 0 0 8px rgba(59,130,246,0.25);
        transform: translateY(-2px);
    }
`;

const TitleName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgb(31, 41, 55);
`;

const AcquiredDate = styled.span`
  font-size: 12px;
  color: rgb(107, 114, 128);
`;

const Description = styled.p`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 8px 0;
  flex-grow: 1;
`;

const ActionButton = styled.button`
  margin-top: auto;
  align-self: center;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #eff6ff;
  }
`;

const Empty = styled.p`
  font-size: 14px;
  color: #888;
`;

const GraphNotice = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  margin-bottom: 8px;
  margin-left: 2px;
  strong {
    color: #6b7280;
  }
`;