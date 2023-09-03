import { useState } from "react";
import styled from "styled-components";
import Edit from "../Edit";
import CategoryIcon from "../CategoryIcon";
import Button from "../elements/Button";
import { calcRem, theme } from "../../styles/theme";
import { priceConverter } from "../../utils/priceConverter";
import { CategoryType, ExpendType } from "../../config";
import { MdDelete } from "react-icons/md";

interface IDetailModal {
  data: ExpendType;
  handleShowDetail: () => void;
  handleShowDelete: () => void;
  handleShowAlert: () => void;
  handleShowConfirm: () => void;
}

const DetailModal = ({
  data,
  handleShowDetail,
  handleShowDelete,
  handleShowAlert,
  handleShowConfirm,
}: IDetailModal) => {
  const [isEdit, setIsEdit] = useState(false);
  const [defaultData, setDefaultData] = useState<ExpendType>(data);
  const { id, category, title, content, date, price } = defaultData;

  const handleEdit = (target: ExpendType) => {
    setDefaultData(target);
    setIsEdit(!isEdit);
  };

  return (
    <StContainer>
      {isEdit ? (
        <Edit
          defaultData={data}
          handleEdit={handleEdit}
          handleClose={() => setIsEdit(!isEdit)}
          handleShowAlert={handleShowAlert}
          handleShowConfirm={handleShowConfirm}
        />
      ) : (
        <>
          <StBody>
            <StDetailHead>
              <CategoryIcon target={category as CategoryType} />
              <h3>{title}</h3>
            </StDetailHead>
            <StDeatilBody>
              <StSubInfo>
                <StDate>
                  {date.split("-")[0]}.{date.split("-")[1]}.{date.split("-")[2]}
                  .
                </StDate>
                <StPrice>{priceConverter(price).previewPrice} ₩</StPrice>
              </StSubInfo>
              <p>{content}</p>
            </StDeatilBody>
            <StDeleteBtn onClick={handleShowDelete}>
              {/* <span>삭제하기</span> */}
              <MdDelete size={`${calcRem(20)}`} fill={`${theme.gray2}`} />
              <span className="a11y-hidden">삭제</span>
            </StDeleteBtn>
          </StBody>
          <StFooter>
            <StBtnWrapper>
              <Button
                btnTheme="blue1"
                btnSize="small1"
                onClick={() => setIsEdit(!isEdit)}
              >
                수정
              </Button>
              <Button
                btnTheme="black"
                btnSize="small1"
                onClick={handleShowDetail}
              >
                취소
              </Button>
            </StBtnWrapper>
          </StFooter>
        </>
      )}
    </StContainer>
  );
};
export default DetailModal;

const StContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(32)};
  width: 100%;
  height: 100%;
  padding: ${calcRem(32)};
`;

const StBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(16)};
  width: 100%;
  height: 100%;
  position: relative;
`;

const StDetailHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${calcRem(10)};

  h3 {
    font-size: ${calcRem(16)};
  }
`;

const StDeatilBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(14)};
  width: 100%;

  p {
    height: ${calcRem(240)};
    overflow-y: scroll;
  }
`;

const StSubInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StDate = styled.span`
  font-size: ${calcRem(12)};
`;

const StPrice = styled.span`
  color: ${theme.blue2};
  font-size: ${calcRem(18)};
  font-weight: 500;
`;

const StFooter = styled.div`
  width: 100%;
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(26)};
`;

const StDeleteBtn = styled.button`
  display: flex;
  align-items: center;
  padding: ${calcRem(6)};
  background-color: ${theme.gray4};
  border: none;
  border-radius: ${calcRem(4)};
  position: absolute;
  top: ${calcRem(-10)};
  right: ${calcRem(-10)};

  span {
    color: ${theme.blue3};
    font-size: ${calcRem(12)};
  }
`;
