import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import plantImage from "../../assets/mypage-img.png";
import lightPointImage from "../../assets/mypage-light.png";
import { Button } from "../../components/Button";
import { ChevronRightIcon } from "../../components/Icons/ChevronIcon";
import { LogoutIcon } from "../../components/Icons/LogoutIcon";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { getCharcterImages } from "../../constants/character";
import { logout, deleteCurrentUser, getCurrentUser } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { clearTokens } from "../../api/tokens";
import { DestructiveConfirmModal } from "../../components/DestructiveConfirmModal";

const MENU_ITEMS = [
  { label: "닉네임 변경", path: "/mypage/nickname" },
  { label: "자가진단 다시하기", path: "/diagnoses" },
  { label: "내 글 보기", path: "/mypage/posts" },
  { label: "심리상담 바로가기", path: "/counsel" },
] as const;

export const MyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: ({ signal }) =>
      callAuthenticated((token) => getCurrentUser(token, { signal }), navigate),
  });

  const logoutMutation = useMutation({
    mutationFn: () => callAuthenticated((token) => logout(token), navigate),
    onSettled: () => {
      clearTokens();
      queryClient.clear();
      navigate("/onboarding", { replace: true });
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  const withdrawMutation = useMutation({
    mutationFn: () =>
      callAuthenticated((token) => deleteCurrentUser(token), navigate),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate("/onboarding", { replace: true });
    },
  });

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const handleWithDraw = () => setIsWithdrawOpen(true);

  const user = userQuery.data;

  console.log(user?.profile?.characterIndex);

  return (
    <Page>
      <Hero aria-hidden="true">
        <PlantImage src={plantImage} alt="" />
        <LightPointImage src={lightPointImage} alt="" />
      </Hero>

      <LogoutButton type="button" aria-label="로그아웃" onClick={handleLogout}>
        <LogoutIcon width={24} height={24} />
      </LogoutButton>

      <ContentCard>
        <Profile>
          <Greeting>
            <Name>{user?.profile?.nickname}</Name>님,
            <br />
            오늘 기분은 어떠신가요?
          </Greeting>
          <Email>{user?.email}</Email>
        </Profile>

        <MenuList>
          {MENU_ITEMS.map(({ label, path }) => (
            <MenuButton
              key={label}
              type="button"
              onClick={() => navigate(path)}
            >
              <span>{label}</span>
              <ChevronRightIcon width={24} height={24} />
            </MenuButton>
          ))}
          <WithdrawButton type="button" onClick={handleWithDraw}>
            회원탈퇴
          </WithdrawButton>
        </MenuList>

        <CounselArea>
          <CounselCharacterImage
            src={getCharcterImages(user?.profile?.characterIndex ?? 1).counsel}
            alt=""
          />
          <CounselContent>
            <CounselText>힘든 일, 고민되는 일이 있나요?</CounselText>
            <Button
              variant="primary"
              size="medium"
              label="익명 심리 상담 하러 가기"
              showIcon
              onClick={() => navigate("/counsel")}
            />
          </CounselContent>
        </CounselArea>
      </ContentCard>

      <DestructiveConfirmModal
        isOpen={isWithdrawOpen}
        title="정말 탈퇴하시겠습니까?"
        description={`회원 탈퇴 시 계정 복구가 불가능하며, 모든 이용 기록이 삭제됩니다. 정말 탈퇴하시겠습니까?`}
        confirmLabel="회원탈퇴"
        cancelLabel="취소"
        isPending={withdrawMutation.isPending}
        onConfirm={() => withdrawMutation.mutate()}
        onCancel={() => setIsWithdrawOpen(false)}
      />
    </Page>
  );
};

const Page = styled.main`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${COLORS.main.main};
`;

const Hero = styled.div`
  position: relative;
  height: 10.25rem;
  flex-shrink: 0;
  overflow: hidden;
`;

const PlantImage = styled.img`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 212px;
  z-index: 10;
  transform: translateX(-50%);
`;

const LightPointImage = styled.img`
  position: absolute;
  left: 50%;
  bottom: -165%;
  width: 100%;
  height: 400px;
  transform: translateX(-50%);
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 2.8125rem;
  right: 1.0625rem;
  z-index: 1;
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${COLORS.gray.gray0};
  cursor: pointer;
`;

const ContentCard = styled.section`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1.25rem;
  border-radius: 10px 10px 0 0;
  background: ${COLORS.gray.gray0};
`;

const Profile = styled.div`
  padding: 0.75rem 0.625rem;
  border-bottom: 1px solid ${COLORS.gray.gray300};
`;

const Greeting = styled.h1`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.lg};
`;

const Name = styled.strong`
  color: ${COLORS.main.darker};
  ${TEXT_STYLE.title.sm};
`;

const Email = styled.p`
  margin-top: 0.375rem;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.ti};
`;

const MenuList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0;
`;

const MenuButton = styled.button`
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 0;
  background: transparent;
  color: ${COLORS.text.black};
  text-align: left;
  cursor: pointer;
  ${TEXT_STYLE.body.sm};

  svg {
    color: ${COLORS.gray.gray400};
  }
`;

const WithdrawButton = styled(MenuButton)`
  justify-content: flex-start;
  color: ${COLORS.state.error};
`;

const CounselArea = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: auto;
`;

const CounselCharacterImage = styled.img`
  width: 4.5rem;
  height: 5.125rem;
  flex-shrink: 0;
  object-fit: contain;
`;

const CounselContent = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
`;

const CounselText = styled.p`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;
