import ApparelIcon from "@/assets/icon_apparel.svg";
import AttractionsIcon from "@/assets/icon_attractions.svg";
import BooksIcon from "@/assets/icon_books.svg";
import CarIcon from "@/assets/icon_car.svg";
import CardIcon from "@/assets/icon_card.svg";
import ElectricalIcon from "@/assets/icon_electrical.svg";
import FoodIcon from "@/assets/icon_food.svg";
import FragranceIcon from "@/assets/icon_fragrance.svg";
import HospitalIcon from "@/assets/icon_hospital.svg";
import PersonIcon from "@/assets/icon_person.svg";

/**
 * 카테고리별 아이콘(토큰 2-5)과 아이콘 자리 색(2-4: 카테고리 색 15% 면 + 아이콘 색).
 * Tailwind가 찾을 수 있게 색 클래스는 전체 문자열로 적는다
 */
export const CATEGORY_ICONS = {
  FOOD: { Icon: FoodIcon, colorClass: "bg-cat-food/15 text-cat-food" },
  APPLIANCE: {
    Icon: ElectricalIcon,
    colorClass: "bg-cat-appliance/15 text-cat-appliance",
  },
  TRANSPORT: {
    Icon: CarIcon,
    colorClass: "bg-cat-transport/15 text-cat-transport",
  },
  MEDICAL: {
    Icon: HospitalIcon,
    colorClass: "bg-cat-medical/15 text-cat-medical",
  },
  CLOTHING: {
    Icon: ApparelIcon,
    colorClass: "bg-cat-clothing/15 text-cat-clothing",
  },
  BEAUTY: {
    Icon: FragranceIcon,
    colorClass: "bg-cat-beauty/15 text-cat-beauty",
  },
  CULTURE: {
    Icon: AttractionsIcon,
    colorClass: "bg-cat-culture/15 text-cat-culture",
  },
  EDUCATION: {
    Icon: BooksIcon,
    colorClass: "bg-cat-education/15 text-cat-education",
  },
  LIVING: { Icon: PersonIcon, colorClass: "bg-cat-living/15 text-cat-living" },
  ETC: { Icon: CardIcon, colorClass: "bg-cat-etc/15 text-cat-etc" },
} as const;

/** 비중 막대의 색 (토큰 2-4·5-4): 카테고리 색. Tailwind가 찾을 수 있게 전체 문자열로 적는다 */
export const CATEGORY_BAR_CLASSES = {
  FOOD: "bg-cat-food",
  APPLIANCE: "bg-cat-appliance",
  TRANSPORT: "bg-cat-transport",
  MEDICAL: "bg-cat-medical",
  CLOTHING: "bg-cat-clothing",
  BEAUTY: "bg-cat-beauty",
  CULTURE: "bg-cat-culture",
  EDUCATION: "bg-cat-education",
  LIVING: "bg-cat-living",
  ETC: "bg-cat-etc",
} as const;
