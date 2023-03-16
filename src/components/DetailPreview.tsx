import React, { useState } from "react";
import styled from "styled-components";
import { CategoryType, ExpendType } from "../config";
import { calcRem, theme } from "../styles/theme";
import { priceConverter } from "../utils/priceConverter";
import CategoryIcon from "./CategoryIcon";
import ModalLayout from "./layout/ModalLayout";
import DeleteModal from "./modal/DeleteModal";
import DetailModal from "./modal/DetailModal";
import ValiModal from "./modal/ValiModal";

interface IDetailPreview {
  handleTargetData: (target: ExpendType) => void;
  targetData?: ExpendType;
  val: ExpendType;
}
const DetailPreview = ({
  handleTargetData,
  targetData,
  val,
}: IDetailPreview) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { id, category, title, content, date, price } = val;

  const handleSelectDetail = (target: ExpendType) => {
    handleTargetData(target);
    setShowDetail(!showDetail);
  };
  const handleShowDetail = () => setShowDetail(!showDetail);
  const handleShowDelete = () => setShowDeleteModal(!showDeleteModal);
  const handleShowAlert = () => setShowAlert(!showAlert);
  const handleShowConfirm = () => setShowConfirm(!showConfirm);

  return (
    <StDetailPreview onClick={() => handleSelectDetail(val)}>
      <StHeader>
        <CategoryIcon target={category as CategoryType} />
        <h3>{title}</h3>
      </StHeader>
      <StSubInfo>
        <StPrice>{priceConverter(price).previewPrice} ₩</StPrice>
        <StDate>{date.replaceAll("-", ".")}</StDate>
      </StSubInfo>
      {showDetail && id === targetData?.id ? (
        <ModalLayout width="84%" height="60%" handleModal={handleShowDetail}>
          <DetailModal
            data={val}
            handleShowDetail={handleShowDetail}
            handleShowDelete={handleShowDelete}
            handleShowAlert={handleShowAlert}
            handleShowConfirm={handleShowConfirm}
          />
        </ModalLayout>
      ) : null}
      {showDeleteModal && id === targetData?.id ? (
        <ModalLayout width="84%" height="25%" handleModal={handleShowDelete}>
          <DeleteModal
            handleShowDetail={handleShowDetail}
            handleClose={handleShowDelete}
            target={val}
          />
        </ModalLayout>
      ) : null}
      {showAlert ? (
        <ModalLayout handleModal={handleShowAlert} width="84%" height="25%">
          <ValiModal type="alert" onClick={handleShowAlert} />
        </ModalLayout>
      ) : null}
      {showConfirm ? (
        <ModalLayout handleModal={handleShowConfirm} width="84%" height="25%">
          <ValiModal type="edit" onClick={handleShowConfirm} />
        </ModalLayout>
      ) : null}
    </StDetailPreview>
  );
};

export default DetailPreview;

const StDetailPreview = styled.li`
  background-color: ${theme.beige1};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(8)};
  width: 100%;
  padding: ${calcRem(10)};
  border-radius: ${calcRem(10)};
  box-shadow: 2px 2px 10px rgba(54, 54, 54, 0.1);
`;

const StHeader = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${calcRem(8)};

  h3 {
    color: ${theme.black};
    font-size: ${calcRem(14)};
  }
`;

const StSubInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const StPrice = styled.span`
  color: ${theme.black};
  font-size: ${calcRem(12)};
`;

const StDate = styled.span`
  color: ${theme.gray2};
  font-size: ${calcRem(10)};
`;
