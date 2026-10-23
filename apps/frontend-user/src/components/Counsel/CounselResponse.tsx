import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselResponseSchema } from "@mindseed/api-types";

type CounselResponseDto = z.infer<typeof CounselResponseSchema>;

type CounselResponseProps = {
  response: CounselResponseDto;
};

export const CounselResponse = ({ response }: CounselResponseProps) => (
  <Container>
    <Content>{response}</Content>
  </Container>
);

const Container = styled.section`
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 6px;
  background: ${COLORS.gray.gray100};
`;

const Content = styled.p`
  color: ${COLORS.text.black};
  white-space: pre-line;
  ${TEXT_STYLE.body.sm};
`;
