import styled from "styled-components";
import { calcRem, theme } from "../../styles/theme";

const Loader = () => {
  return (
    <StLoader>
      <StSpinner></StSpinner>
    </StLoader>
  );
};

export default Loader;

const StLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(6)};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const StSpinner = styled.span`
  display: inline-block;
  width: ${calcRem(60)};
  height: ${calcRem(60)};
  border: ${calcRem(5)} solid ${theme.white};
  border-bottom-color: ${theme.blue4};
  border-radius: 50%;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
