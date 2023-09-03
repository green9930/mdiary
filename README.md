# 내가 얼마 썼는지만 알고 싶을 때, 다씀🖌️

<div>
 
 ![resize_thumbnail_dasseum](https://user-images.githubusercontent.com/69451758/225200431-0b662619-ad16-4104-8f49-10d971712c38.png)
 
</div>

## 프로젝트 기획 의도 

<p>
최근 대다수 가계부 앱들이 계좌/카드 연동, 지출 유형 관리(카드/현금/할부) 등 다양한 기능을 제공하며 오히려 지출 내역만 관리할 수 있는 앱을 찾기 어려웠습니다. <br />
따라서 다른 부가기능 없이 간단하게 <b> 내가 얼마 썼는지만 </b> 한눈에 볼 수 있는 가계부 앱을 직접 개발해보기로 했고, <br />
오로지 지출 내역만 기간, 카테고리 별로 관리할 수 있는 '다씀'을 기획하게 되었습니다.
</p>

<br />

<b>🚧 Last Update : 2023.09.04</b>

<br />
<br />

## 서비스 이동하기

🚨 '다씀'은 모바일에 최적화된 서비스입니다. 
 
🔗 [다씀 바로가기 URL](https://green9930.github.io/mdiary)  
  
⬇️ QR코드로 다씀 바로가기  
  
<img src="https://user-images.githubusercontent.com/69451758/224851439-efd5d8d6-c181-4fde-9bd0-b9b9ff4bc7e4.png" alt="dasseum" width="200px" height="200px" />  


### 설치 방법

'다씀'은 PWA로 개발되었습니다. 웹페이지 접속 후 '홈에서 바로가기'를 통해 사용할 수 있습니다.  

<details>

 <summary>
  <b>📱 iOS 설치 방법</b> 
 </summary>

 <br />

 ![ios01](https://user-images.githubusercontent.com/69451758/224860521-41c9e9b3-49e4-4e29-b77a-8717f9a14635.jpg) |![ios02](https://user-images.githubusercontent.com/69451758/224860523-eb0b4334-1ad3-40a6-b116-9dbd27c7a18f.jpg) | ![ios03](https://user-images.githubusercontent.com/69451758/224860526-467673a5-0d3b-4aac-b7b4-20f04558a6c4.jpg) 
--- | --- | --- |

</details>
<details>

 <summary>
  <b>📱 Android 설치 방법</b> 
 </summary>

 <br />

 ![android01](https://user-images.githubusercontent.com/69451758/224860509-a1d2ea71-69b5-44ce-bb3d-9f960fc3124c.jpg) |![android02](https://user-images.githubusercontent.com/69451758/224860514-6f42b1f7-67e9-4905-b1c7-6bf1d2c9d643.jpg) | ![android03](https://user-images.githubusercontent.com/69451758/224860518-9eb797f0-6547-4cf6-b9f8-52af9c428732.JPG) | ![android04](https://user-images.githubusercontent.com/69451758/224860520-ee1017e5-30e3-4eed-82a1-d570259d3260.JPG) 
--- | --- | --- | --- |

</details>

<br />

## Tech Stack
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/redux toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white">
  <img src="https://img.shields.io/badge/firebase-2E77BC?style=for-the-badge&logo=firebase&logoColor=white">
<br />
 <img src="https://img.shields.io/badge/React Router-CA4245?style=for-the-badge&logo=React Router&logoColor=white">
 <img src="https://img.shields.io/badge/Styled Components-DB7093?style=for-the-badge&logo=styledComponents&logoColor=white">
 <img src="https://img.shields.io/badge/gh pages-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">
</p>

<br />

## 서비스 안내

<details>
  
  <summary><b>🔐 로그인 페이지</b></summary>
  <br />
 
  <div style="display: flex">  
    <img src="https://user-images.githubusercontent.com/69451758/224855576-b1da1085-4131-4475-a88b-666d3cdb08c3.PNG" alt="dasseum" width="300px" />
  </div>

  - firebase Google 소셜로그인을 통해 이용할 수 있습니다.  
  - 회원가입 전, '체험해보기'를 통해 서비스를 미리 이용해 볼 수 있습니다. 
  
</details>
<details>
  
  <summary><b>📆 월간 / 주간 / 일간 / 카페고리 페이지</b></summary>
  <br />

  ![write01](https://user-images.githubusercontent.com/69451758/224855580-d92716fb-84a5-46f3-ab9b-7fa68dd957c9.PNG) |![write02](https://user-images.githubusercontent.com/69451758/224855583-b192bd65-2364-4e64-8db0-86e584fa42d8.PNG) | ![write03](https://user-images.githubusercontent.com/69451758/224855585-9832006c-5be3-4fe5-9ed4-f5bf2d65916c.PNG) | ![read04](https://user-images.githubusercontent.com/69451758/224855586-d4a3b778-0c39-4bf6-bc6f-c664238561f5.PNG) 
 --- | --- | --- | --- |
 
  - 내가 쓴 내역을 월간, 주간, 일간, 카테고리별로 묶어서 한 눈에 볼 수 있습니다.   
  - 각 페이지별로 총 지출액과 세부내역을 함께 확인할 수 있습니다.  
  
</details>
<details>

  <summary><b>💸 작성 페이지</b></summary>
  <br />
 
  ![write01](https://user-images.githubusercontent.com/69451758/224855588-917c9c51-ec2c-409b-bd15-1e20f5a93fd2.PNG) |![write02](https://user-images.githubusercontent.com/69451758/224855591-1d1ed5ec-0b97-4805-8951-b4a337911864.PNG) | ![write03](https://user-images.githubusercontent.com/69451758/224855593-04e218e3-d565-47bd-a9aa-d58404751cb1.PNG) 
 --- | --- | --- |

  - 지출 내역을 작성할 수 있습니다.  
  
</details>
<details>

  <summary><b>🗑️ 게시글 수정 및 삭제</b></summary>
  <br />
 
  ![edit01](https://user-images.githubusercontent.com/69451758/224855594-15b1d1e1-ed03-4eac-949f-1d69ab46b2ec.PNG) | ![edit02](https://user-images.githubusercontent.com/69451758/224855596-988580c2-f4db-4881-8f14-0335cd0efb2d.PNG) | ![edit03](https://user-images.githubusercontent.com/69451758/224855599-304844ff-16a7-4e10-8264-0ccb7e68b9ac.PNG) 
--- | --- | --- |

  - 게시글 상세보기 모달에서 수정 및 삭제할 수 있습니다.  

</details>

<br />

## 2023.09.04 Update

<details>
   <summary><b>✅ MonthlyPage Calendar 커스터마이징</b></summary>
   <br />

   <p>
    <b>💡 변경 이유</b> <br />
   기존에는 react-calendar 라이브러리를 사용해 디자인을 일부 커스텀하여 사용했습니다. <br />
   하지만 원하는 구간 이동, 지출 내역 관리 등의 기능 구현과 디자인 커스텀에 불편함이 많아 달력을 직접 제작하며 UI도 일부 변경하였습니다. <br />
   </p>

   
   ➡️ [react 라이브러리 없이 달력 만들기](https://velog.io/@green9930/react-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-%EC%97%86%EC%9D%B4-%EB%8B%AC%EB%A0%A5-%EB%A7%8C%EB%93%A4%EA%B8%B0)
   
   <br />

   ![monthly01](https://github.com/green9930/mdiary/assets/69451758/72d0f949-cbac-483c-86e0-ebe7cd35ea03) | ![monthly02](https://github.com/green9930/mdiary/assets/69451758/908b4750-3192-4f76-8132-1d6c30542f82) | ![monthly03](https://github.com/green9930/mdiary/assets/69451758/dfff2358-f690-40bf-b39b-893aa91b7fa2)
   --- | --- | --- |

</details>
<details>
   <summary><b>✅ CategoryPage 기간별 모아보기 기능 추가</b></summary>
   <br />

   <p>
    <b>💡 변경 이유</b> <br />
   기존에는 전체 기간 내에서 카테고리 별로 필터링하여 지출 내역을 확인할 수 있었습니다. <br />
   달마다 구분선을 넣어 내역을 월별로 확인할 수 있었지만 전체 지출 금액 표시는 전체 기간이 기준이었기 때문에 소비 습관 판단에 효용성이 낮았습니다. <br />
   따라서 카테고리와 기간을 모두 선택할 수 있도록 하여 원하는 기간의 특정 카테고리 지출 내역을 모아 볼 수 있도록 개선했습니다. <br />
   </p>
 
  ![IMG_3307](https://github.com/green9930/mdiary/assets/69451758/fd968d26-5e70-4469-9167-8f13c5a890da) | ![IMG_3306](https://github.com/green9930/mdiary/assets/69451758/b23c4adb-4cc2-433c-8fe3-c3e78911ceba) | ![IMG_3305](https://github.com/green9930/mdiary/assets/69451758/af71ff71-8f14-4f61-b5ee-918dbada94ed) | ![IMG_3304](https://github.com/green9930/mdiary/assets/69451758/7a91c214-b02a-47af-bb52-6cac5e775e91)
   --- | --- | --- | --- |
 
</details>

<br />
<br />

