import React, { useState } from "react";
import { ExpendType } from "../config";
import ModalLayout from "./layout/ModalLayout";
import DeleteModal from "./modal/DeleteModal";
import DetailModal from "./modal/DetailModal";

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

  const { id, category, title, content, date, price } = val;

  const handleSelectDetail = (target: ExpendType) => {
    // setTargetData(target);
    handleTargetData(target);
    setShowDetail(!showDetail);
  };
  const handleShowDetail = () => setShowDetail(!showDetail);
  const handleShowDelete = () => setShowDeleteModal(!showDeleteModal);

  return (
    <li key={id} onClick={() => handleSelectDetail(val)}>
      <h3>{title}</h3>
      <p>{price}</p>
      {showDetail && id === targetData?.id ? (
        <ModalLayout height="50%" handleModal={handleShowDetail}>
          <DetailModal
            data={val}
            handleShowDetail={handleShowDetail}
            handleShowDelete={handleShowDelete}
          />
        </ModalLayout>
      ) : null}
      {showDeleteModal && id === targetData?.id ? (
        <ModalLayout height="50%" handleModal={handleShowDelete}>
          <DeleteModal
            handleShowDetail={handleShowDetail}
            handleClose={handleShowDelete}
            target={val}
          />
        </ModalLayout>
      ) : null}
    </li>
  );
};

export default DetailPreview;
