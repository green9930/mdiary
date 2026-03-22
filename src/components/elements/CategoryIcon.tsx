import { ExpendTypes } from "@/types/expendTypes";
import { expendCategories } from "@/constants/expendConstants";

import IconApparel from "@/assets/icon_apparel.svg";
import IconFood from "@/assets/icon_food.svg";
import IconElectrical from "@/assets/icon_electrical.svg";
import IconCard from "@/assets/icon_card.svg";
import IconCar from "@/assets/icon_car.svg";
import IconBooks from "@/assets/icon_books.svg";
import IconHospital from "@/assets/icon_hospital.svg";
import IconFragrance from "@/assets/icon_fragrance.svg";
import IconAttractions from "@/assets/icon_attractions.svg";

interface CategoryIconProps {
  target: ExpendTypes;
}

const IconGenerator = ({ target }: CategoryIconProps) => {
  const svgStyle = {
    w06: "w-6 h-6 fill-white",
  };

  switch (target) {
    case expendCategories.appliance:
      return <IconElectrical className={`${svgStyle.w06}`} />;
    case expendCategories.transport:
      return <IconCar className={`${svgStyle.w06}`} />;
    case expendCategories.culture:
      return <IconAttractions className={`${svgStyle.w06}`} />;
    case expendCategories.beauty:
      return <IconFragrance className={`${svgStyle.w06}`} />;
    case expendCategories.food:
      return <IconFood className={`${svgStyle.w06}`} />;
    case expendCategories.medical:
      return <IconHospital className={`${svgStyle.w06}`} />;
    case expendCategories.clothing:
      return <IconApparel className={`${svgStyle.w06}`} />;
    case expendCategories.education:
      return <IconBooks className={`${svgStyle.w06}`} />;
    case expendCategories.etc:
      return <IconCard className={`${svgStyle.w06}`} />;
    default:
      return <IconCard className={`${svgStyle.w06}`} />;
  }
};

export const CategoryIcon = ({ target }: CategoryIconProps) => {
  const generateColor = (target: ExpendTypes) => {
    switch (target) {
      case expendCategories.appliance:
        return "bg-blue01";
      case expendCategories.transport:
        return "bg-brown01";
      case expendCategories.culture:
        return "bg-pink02";
      case expendCategories.beauty:
        return "bg-pink01";
      case expendCategories.food:
        return "bg-green01";
      case expendCategories.medical:
        return "bg-blue03";
      case expendCategories.clothing:
        return "bg-orange01";
      case expendCategories.education:
        return "bg-blue02";
      case expendCategories.etc:
        return "bg-bg04";
      default:
        return "bg-bg04";
    }
  };

  return (
    <div
      className={`w-9 h-9 rounded-[36px] flex items-center justify-center ${generateColor(target)}`}>
      {IconGenerator({ target })}
    </div>
  );
};
