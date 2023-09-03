import React, { useEffect } from "react";
import styled from "styled-components";

interface IModal extends React.HTMLAttributes<HTMLDivElement> {
  width: string;
  height: string;
  children: React.ReactNode;
}

const ModalLayout = ({ children, width, height }: IModal) => {
  // 모달 뒤 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);

  return (
    <StLayout>
      <StModalBody
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        width={width}
        height={height}
      >
        {children}
      </StModalBody>
    </StLayout>
  );
};

export default ModalLayout;

const StLayout = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 95;
`;

const StModalBody = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background-color: ${({ theme }) => theme.white};
  border-radius: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 99;
  transform: translate(-50%, -50%);
`;
