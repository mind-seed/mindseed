import styled from "styled-components";
import bannerImg from "../../assets/BannerImage.png";

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
