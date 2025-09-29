// TestInterview.tsx
import React, {useCallback, useEffect, useState} from 'react';
import styled, { css } from 'styled-components';
import Modal from '../Modal';
import LinkEditForm from './LinkEditForm.tsx';
import kakaoLogo from '../../assets/kakao_logo.png';
import googleLogo from '../../assets/google_logo.png';
import zoomLogo from '../../assets/zoom_logo.png';
import discordLogo from '../../assets/discord_logo.png';
import naverLogo from '../../assets/naver_logo.png';
import {NavLink, useOutletContext, useParams} from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.ts";

const channelIconMap: { [key: string]: string } = {
    Kakao: kakaoLogo,
    Google: googleLogo,
    Zoom: zoomLogo,
    Discord: discordLogo,
    Naver: naverLogo,
};

type Channel = {
    name: string;
    url: string;
    icon: string;
};

interface StudyRoomContext {
    studyId: string;
    userRole: 'LEADER' | 'MEMBER' | null;
    studyStatus: 'RECRUITING' | 'COMPLETED' | 'CLOSED';
    onLeaveOrClose: () => void;
}

/* --- NEW: Tab Navigation styled-components --- */
const NavContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.border};

    background-color: ${({ theme }) => theme.surface};
    padding: 12px 20px;
    border-radius: 8px;
`;

const TabList = styled.nav`
  display: flex;
  gap: 8px;
`;

const TabLink = styled(NavLink)`
    padding: 10px 16px;
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.subtle};
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;

    &:hover {
        color: ${({ theme }) => theme.fg};
    }

    &.active {
        color: ${({ theme }) => theme.accent ?? theme.primary};
        border-bottom-color: ${({ theme }) => theme.accent ?? theme.primary};
    }
`;
/* --- End of Tab Navigation --- */

/* ─ styled-components (scoped) ─ */
const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
    padding: 0 8px 24px 8px;

    h2 {
        margin: 0;
        font-size: 20px;
        color: ${({ theme }) => theme.fg};
    }
`;

const ContentWrapper = styled.div`
  margin-top: 24px;
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 24px;
`;

const Description = styled.p`
    font-size: 15px;
    color: ${({ theme }) => theme.subtle};
    line-height: 1.6;
    margin-bottom: 32px;
    text-align: center;
`;

const Grid = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px; /* 아이콘 버튼과 수정 버튼 사이 간격 */
`;

const channelButtonBase = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.surfaceHover};
    color: ${({ theme }) => theme.fg};
    text-decoration: none;
    border-radius: 10px;
    padding: 16px;
    width: 100px;
    height: 100px;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.border};
    }
`;

const LinkBtn = styled.a`
  ${channelButtonBase}
`;



const Icon = styled.img`
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
`;

const Name = styled.span`
  font-size: 14px;
`;

const DisabledBtn = styled.div`
    ${channelButtonBase}
    cursor not-allowed;

    /* ✅ [수정] 자식 Icon 컴포넌트에 흑백 필터를 적용합니다. */
    & ${Icon} {
        filter: grayscale(100%);
        opacity: 0.6;
    }

    /* ✅ [수정] 전체 버튼을 흐리게 하는 대신, 이름만 흐리게 처리 */
    & ${Name} {
        opacity: 0.5;
    }

    &:hover {
        background-color: ${({ theme }) => theme.surfaceHover};
    }
`;

const EditButton = styled.button`
    background-color: transparent;
    color: ${({ theme }) => theme.subtle};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 12px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.fg};
        color: ${({ theme }) => theme.fg};
    }
`;

const TestInterview: React.FC = () => {
    const { id: studyRoomId } = useParams<{ id: string }>();
    const { studyId, userRole, studyStatus, onLeaveOrClose } = useOutletContext<StudyRoomContext>();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

    const fetchChannels = useCallback(async () => {
        if (!studyId) return;
        try {
            const response = await axiosInstance.get(`/study-rooms/${studyId}/interview-channels`);
            // API 응답 데이터에 프론트엔드에서 사용할 아이콘 경로를 추가합니다.
            const channelsWithIcons = response.data.map((channel: { name: string; url: string }) => ({
                ...channel,
                icon: channelIconMap[channel.name] || '', // 이름에 맞는 아이콘 매핑
            }));
            setChannels(channelsWithIcons);
        } catch (error) {
            console.error("모의면접 채널 링크를 불러오는데 실패했습니다:", error);
        }
    }, [studyId]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleOpenModal = (channel: Channel) => {
        setEditingChannel(channel);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingChannel(null);
    };

    const handleUpdateLink = async (newUrl: string) => {
        if (!editingChannel || !studyId) return;
        try {
            // 백엔드에 PUT 요청을 보내 URL을 업데이트합니다.
            await axiosInstance.put(`/study-rooms/${studyId}/interview-channels`, {
                channelName: editingChannel.name,
                url: newUrl,
            });

            // API 요청이 성공하면, 프론트엔드의 상태도 업데이트하여 화면에 즉시 반영합니다.
            setChannels(prev =>
                prev.map(ch => (ch.name === editingChannel.name ? { ...ch, url: newUrl } : ch)),
            );
            handleCloseModal();
            alert("링크가 성공적으로 저장되었습니다.");

        } catch (error) {
            console.error("링크 업데이트에 실패했습니다:", error);
            alert("링크 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <Container>
            <Header>
                <h2>🎙️모의면접채널</h2>
            </Header>

            <NavContainer>
                <TabList>
                    <TabLink to={`/studies/joined-study/${studyId}`} end>공지사항</TabLink>
                    <TabLink to={`/studies/joined-study/${studyId}/schedule`}>일정관리</TabLink>
                    <TabLink to={`/studies/joined-study/${studyId}/interview`}>모의면접</TabLink>
                    <TabLink to={`/studies/joined-study/${studyId}/members`}>참여인원</TabLink>
                    {userRole === 'LEADER' && (
                        <>
                            <TabLink to={`/studies/joined-study/${studyId}/applications`}>신청관리</TabLink>
                            <TabLink to={`/studies/joined-study/${studyId}/attendance`}>출석관리</TabLink>
                        </>
                    )}
                </TabList>
            </NavContainer>

            <ContentWrapper>
            <Description>
                선호하는 플랫폼을 선택하여 모의면접 채널에 참여하세요.
                <br />
                링크를 등록하거나 수정할 수 있습니다.
            </Description>

            <Grid>
                {channels.map(channel => {
                    const disabled = !channel.url;

                    return (
                        <Item key={channel.name}>
                            {disabled ? (
                                <DisabledBtn>
                                    <Icon src={channel.icon} alt={channel.name} />
                                    <Name>{channel.name}</Name>
                                </DisabledBtn>
                            ) : (
                                <LinkBtn href={channel.url} target="_blank" rel="noopener noreferrer">
                                    <Icon src={channel.icon} alt={channel.name} />
                                    <Name>{channel.name}</Name>
                                </LinkBtn>
                            )}
                            {studyStatus !== 'CLOSED' && userRole === 'LEADER' && (
                            <EditButton onClick={() => handleOpenModal(channel)}>
                                {disabled ? '링크 등록' : '링크 수정'}
                            </EditButton>
                            )}
                        </Item>
                    );
                })}
            </Grid>
            </ContentWrapper>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {editingChannel && (
                    <LinkEditForm
                        channelName={editingChannel.name}
                        initialUrl={editingChannel.url}
                        onSubmit={handleUpdateLink}
                    />
                )}
            </Modal>
        </Container>
    );
};

export default TestInterview;
