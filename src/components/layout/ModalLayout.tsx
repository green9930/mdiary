import React, { useEffect } from "react";
import styled from "styled-components";
import { calcRem } from "../../styles/theme";

interface IModal extends React.HTMLAttributes<HTMLDivElement> {}

interface IModal {
  height: number;
  handleModal: () => void;
}

const ModalLayout: React.FC<IModal> = ({ children, height, handleModal }) => {
  useEffect(() => {
    document.body.style.cssText = `
      position: fixed;  
      top: -${window.scrollY}px;
      left: 50%;
      width: 100%;
      transform: translateX(-50%);
    `;

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    };
  }, []);

  return (
    <StModalLayout onClick={handleModal}>
      <StModalBody
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        height={height}
      >
        {children}
      </StModalBody>
    </StModalLayout>
  );
};

export default ModalLayout;

const StModalLayout = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

const StModalBody = styled.div<{ height: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  padding: ${calcRem(20)};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: ${({ height }) => calcRem(height)};
  background-color: #ffffff;
  border-radius: 5px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
`;
