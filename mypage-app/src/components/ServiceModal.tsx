import React from "react";
import styled from "styled-components";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ServiceModal({ isOpen, onClose }: ServiceModalProps) {
    return (
        <Overlay isOpen={isOpen}>
            <ModalContent isOpen={isOpen}>
                <Title>서비스 준비 중</Title>

                <Message>
                    해당 기능은 현재 준비 중입니다. <br />
                    곧 만나보실 수 있어요 😊
                </Message>

                <CloseButton onClick={onClose}>닫기</CloseButton>
            </ModalContent>
        </Overlay>
    );
}

/* ================== styled-components ================== */

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;

  background: ${({ isOpen }) => (isOpen ? "rgba(0, 0, 0, 0.5)" : "transparent")};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease-in-out;
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 360px;
  text-align: center;

  transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
  transition: all 0.3s ease-in-out;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: rgb(17, 24, 39);
`;

const Message = styled.p`
  font-size: 15px;
  color: rgb(75, 85, 99);
  margin-bottom: 20px;
  line-height: 1.6;
`;

const CloseButton = styled.button`
    padding: 10px 20px;
    background: rgb(59, 130, 246);
    border: none;          /* 기본 검정 테두리 제거 */
    color: white;
    border-radius: 6px;
    transition: background 0.2s ease-in-out;

    &:hover {
        background: rgb(37, 99, 235);
    }
`;


// import React from "react";
// import "../assets/tailwind.css";
//
// interface ServiceModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }
//
// export default function ServiceModal({ isOpen, onClose }: ServiceModalProps) {
//     return (
//         <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ease-in-out
//                   ${isOpen ? "opacity-100 visible bg-[rgba(0,0,0,0.5)]" : "opacity-0 invisible"}`}>
//
//             <div className={`bg-white rounded-[12px] shadow-xl p-[24px] w-[360px] text-center transform transition-all duration-300 ease-in-out
//                     ${isOpen ? "scale-100" : "scale-95"}`}>
//
//                 <h2 className="text-[20px] font-[700] mb-[12px] text-gray-900">
//                     서비스 준비 중
//                 </h2>
//
//                 <p className="text-[15px] text-gray-600 mb-[20px] leading-relaxed">
//                     해당 기능은 현재 준비 중입니다. <br />
//                     곧 만나보실 수 있어요 😊
//                 </p>
//
//                 <button onClick={onClose} className="px-[20px] py-[10px] bg-[rgb(59,130,246)] text-white rounded-[6px]
//                      hover:bg-[rgb(37,99,235)] transition-colors duration-200">
//                     닫기
//                 </button>
//
//             </div>
//         </div>
//     );
// }