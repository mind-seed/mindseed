import styled from "styled-components";
import bannerImg from "../../assets/banner-img.png";

export const Banner = () => {
  return (
    <>
      <BannerImage src={bannerImg} />
    </>
  );
};

const BannerImage = styled.img`
  width: 100%;
`;
