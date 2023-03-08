import {
  MdElectricalServices,
  MdEmojiTransportation,
  MdAttractions,
  MdFace2,
  MdFastfood,
  MdOutlineLocalHospital,
  MdLocalOffer,
  MdSchool,
  MdAddCard,
} from "react-icons/md";
import styled from "styled-components";
import { CategoryType } from "../config";
import { calcRem, theme } from "../styles/theme";

interface ICategoryIcon {
  target: CategoryType;
}

const convertIconColor = (target: CategoryType) => {
  switch (target) {
    case "가전":
      return "#8bb2f5";
    case "교통":
      return "#eed740";
    case "문화생활":
      return "#b97bf6";
    case "미용":
      return "#72e1e3";
    case "식비":
      return "#e93a1f";
    case "의료":
      return "#a9d635";
    case "의류":
      return "#3ec03a";
    case "학비":
      return "#fbab00";
    case "기타":
      return "#a2a2a2";
    default:
      return "#a2a2a2";
  }
};

const Icon = ({ target }: ICategoryIcon) => {
  switch (target) {
    case "가전":
      return <MdElectricalServices size={24} />;
    case "교통":
      return <MdEmojiTransportation size={24} />;
    case "문화생활":
      return <MdAttractions size={24} />;
    case "미용":
      return <MdFace2 size={24} />;
    case "식비":
      return <MdFastfood size={24} />;
    case "의료":
      return <MdOutlineLocalHospital size={24} />;
    case "의류":
      return <MdLocalOffer size={24} />;
    case "학비":
      return <MdSchool size={24} />;
    case "기타":
      return <MdAddCard size={24} />;
    default:
      return <MdAddCard size={24} />;
  }
};

console.log();
const CategoryIcon = ({ target }: ICategoryIcon) => {
  return (
    <StCategoryIcon bg={convertIconColor(target)}>
      <Icon target={target} />
    </StCategoryIcon>
  );
};

export default CategoryIcon;

const StCategoryIcon = styled.div<{ bg: string }>`
  background-color: ${({ bg }) => `${bg}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${calcRem(8)};
  width: ${calcRem(40)};
  border-radius: 50%;

  svg {
    background-color: ${({ bg }) => `${bg}`};
    color: ${theme.white};
  }
`;
