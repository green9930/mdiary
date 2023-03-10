import React, { useState } from "react";
import styled from "styled-components";
import { CategoryType, ExpendType } from "../../config";
import { calcRem, theme } from "../../styles/theme";
import { priceConverter } from "../../utils/priceConverter";
import CategoryIcon from "../CategoryIcon";
import Edit from "../Edit";
import Button from "../elements/Button";
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
    <StDetail>
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
          <StDetailHead>
            <CategoryIcon target={category as CategoryType} />
            <h3>{title}</h3>
          </StDetailHead>
          <StDeatilBody>
            <StSubInfo>
              <StDate>
                {date.split("-")[0]}.{date.split("-")[1]}.{date.split("-")[2]}.
              </StDate>
              <StPrice>{priceConverter(price).previewPrice} ₩</StPrice>
            </StSubInfo>
            <p>{content}</p>
          </StDeatilBody>
          <StDetailFooter>
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
          </StDetailFooter>
          <StDeleteBtn onClick={handleShowDelete}>
            {/* <span>삭제하기</span> */}
            <MdDelete size={`${calcRem(20)}`} fill={`${theme.red3}`} />
            <span className="a11y-hidden">삭제</span>
          </StDeleteBtn>
        </>
      )}
    </StDetail>
  );
};
export default DetailModal;

const StDetail = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const StDetailHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${calcRem(10)};
  margin: ${calcRem(30)} 0 ${calcRem(16)} 0;
  h3 {
    font-size: ${calcRem(16)};
  }
`;

const StDeatilBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${calcRem(14)};

  p {
    height: ${calcRem(200)};
    overflow: scroll;
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

const StDetailFooter = styled.div`
  width: 100%;
  position: absolute;
  bottom: ${calcRem(0)};
  left: 50%;
  transform: translateX(-50%);
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
  position: absolute;
  top: ${calcRem(-10)};
  right: ${calcRem(-10)};

  /* border: none; */
  /* border-radius: 50%; */
  border-radius: ${calcRem(4)};
  padding: ${calcRem(6)};
  border: 1px solid ${theme.red3};
  background-color: transparent;
  /* background-color: ${theme.red3}; */
  span {
    color: ${theme.blue3};
    font-size: ${calcRem(12)};
  }
`;
