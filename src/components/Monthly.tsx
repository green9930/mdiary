import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { deleteExpend, ExpendType } from "../context/modules/expendSlice";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import DeleteModal from "./modal/DeleteModal";

const Monthly = () => {
  const [value, onChange] = useState(new Date());
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetId, setTargetId] = useState("");
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

  const handleSelectDetail = (id?: string) => {
    setTargetId(id as string);
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
            <li key={id} onClick={() => handleSelectDetail(id)}>
              <h3>{title}</h3>
              <p>{price}</p>
              {showDetail && id === targetId ? (
                <ModalLayout height="50%" handleModal={handleShowDetail}>
                  <StDetail>
                    <StDetailHead>
                      <h3>{title}</h3>
                      <span>{category}</span>
                      <span>{date}</span>
                    </StDetailHead>
                    <StDeatilBody>
                      <span>{price}</span>
                      <p>{content}</p>
                    </StDeatilBody>
                    <StDetailFooter>
                      <button>EDIT</button>
                      <button onClick={handleShowDelete}>DELETE</button>
                    </StDetailFooter>
                    <button onClick={handleShowDetail}>X</button>
                  </StDetail>
                </ModalLayout>
              ) : null}
              {showDeleteModal && id === targetId ? (
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
