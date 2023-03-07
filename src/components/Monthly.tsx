import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import { ExpendType } from "../context/modules/expendSlice";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import DeleteModal from "./modal/DeleteModal";
import DetailModal from "./modal/DetailModal";

const Monthly = () => {
  const [value, onChange] = useState(new Date());
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dataArr = useAppSelector((state) => state.expend);

  useEffect(() => {
    if (dataArr) {
      const dateStr = `${value.getFullYear()}-${(value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${value.getDate().toString().padStart(2, "0")}`;
      console.log("CHANGE DATE");
      setTargetDataArr(
        dataArr.filter((val) => {
          return val.date === dateStr;
        })
      );
    }
  }, [value, dataArr.length]);

  const handleSelectDetail = (target: ExpendType) => {
    setTargetData(target);
    setShowDetail(!showDetail);
  };
  const handleShowDetail = () => setShowDetail(!showDetail);
  const handleShowDelete = () => setShowDeleteModal(!showDeleteModal);

  return (
    <StMonthly>
      <h2>Monthly</h2>
      <div>
        <Calendar
          formatDay={(locale, date) =>
            date.toLocaleString("en", { day: "numeric" })
          }
          calendarType="US"
          onChange={onChange}
          value={value}
        />
      </div>
      <StExpendList>
        {targetDataArr.map((val, idx) => {
          const { id, category, title, content, date, price } = val;
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
        })}
      </StExpendList>
    </StMonthly>
  );
};

export default Monthly;

const StMonthly = styled.div``;

const StExpendList = styled.ul`
  background-color: pink;
`;

const StDetail = styled.div``;

const StDetailHead = styled.div``;

const StDeatilBody = styled.div``;

const StDetailFooter = styled.div``;
