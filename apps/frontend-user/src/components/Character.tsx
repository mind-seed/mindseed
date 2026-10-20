import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Lottie } from "lottie-react";
import { Button } from "./Button";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

export type CharacterId = "char1" | "char2" | "char3" | "char4";
export type CharacterAction =
  | "default"
  | "blinking"
  | "excited"
  | "looking"
  | "hello"
  | "curious"
  | "whoa"
  | "yawn";

export type CharacterProps = {
  characterIndex: number;
};

type AnimationData = {
  assets?: { p?: string; u?: string; e?: number; [key: string]: unknown }[];
  [key: string]: unknown;
};

type Playback = {
  id: number;
  key: string;
  action: CharacterAction;
  data: AnimationData;
  loop: boolean | number;
};

type PlaybackRequest = {
  id: number;
  action: CharacterAction;
  loop: boolean | number;
};

const INTERACTION_ACTIONS: Record<CharacterId, CharacterAction[]> = {
  char1: ["excited", "looking"],
  char2: ["excited", "hello"],
  char3: ["excited", "curious"],
  char4: ["whoa", "yawn"],
};

const ANIMATION_CHARACTER_IDS: Partial<Record<number, CharacterId>> = {
  0: "char1",
  1: "char2",
  2: "char3",
  3: "char4",
};

const animationLoads = new Map<string, Promise<AnimationData>>();

const getDefaultRepeats = () => 1 + Math.floor(Math.random() * 2);

const loadAnimation = (characterId: CharacterId, action: CharacterAction) => {
  const path = `/lottie/${characterId}/${action}.json`;
  const cached = animationLoads.get(path);
  if (cached) return cached;

  const request = (async () => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Animation request failed: ${response.status}`);
    }

    const data: AnimationData = await response.json();
    const imageLoads = (data.assets ?? []).flatMap((asset) => {
      if (!asset.p) return [];

      asset.u = `/lottie/${characterId}/images/`;
      asset.e = 0;

      const image = new Image();
      image.src = `${asset.u}${asset.p}`;
      return [image.decode()];
    });

    await Promise.all(imageLoads);
    return data;
  })();

  animationLoads.set(path, request);
  void request.catch(() => animationLoads.delete(path));
  return request;
};

export const Character = ({ characterIndex }: CharacterProps) => {
  const characterId = ANIMATION_CHARACTER_IDS[characterIndex];

  if (!characterId) {
    return <CharacterError />;
  }

  return <CharacterPlayer key={characterId} characterId={characterId} />;
};

const CharacterPlayer = ({ characterId }: { characterId: CharacterId }) => {
  const [request, setRequest] = useState<PlaybackRequest>({
    id: 0,
    action: "default",
    loop: getDefaultRepeats(),
  });
  const [current, setCurrent] = useState<Playback | null>(null);
  const [next, setNext] = useState<Playback | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);
  const switchingKeyRef = useRef<string | null>(null);
  const paintFrameRef = useRef(0);
  const swapFrameRef = useRef(0);

  const requestPlayback = (
    action: CharacterAction,
    loop: boolean | number = false,
  ) => {
    setRequest((previous) => ({ id: previous.id + 1, action, loop }));
  };

  const handleInteraction = () => {
    if (
      !current ||
      next ||
      request.id !== current.id ||
      (current.action !== "default" && current.action !== "blinking")
    ) {
      return;
    }

    const actions = INTERACTION_ACTIONS[characterId];
    requestPlayback(actions[Math.floor(Math.random() * actions.length)]);
  };

  const handleComplete = (playback: Playback) => {
    if (current?.key !== playback.key || request.id !== playback.id) return;

    if (playback.action === "default") {
      requestPlayback("blinking");
    } else {
      requestPlayback("default", getDefaultRepeats());
    }
  };

  const handleFirstFrame = (playback: Playback) => {
    if (
      next?.key !== playback.key ||
      switchingKeyRef.current === playback.key
    ) {
      return;
    }

    switchingKeyRef.current = playback.key;
    paintFrameRef.current = window.requestAnimationFrame(() => {
      swapFrameRef.current = window.requestAnimationFrame(() => {
        setCurrent(playback);
        setNext(null);
        switchingKeyRef.current = null;
      });
    });
  };

  useEffect(() => {
    const actions: CharacterAction[] = [
      "default",
      "blinking",
      ...INTERACTION_ACTIONS[characterId],
    ];
    void Promise.allSettled(
      actions.map((action) => loadAnimation(characterId, action)),
    );
  }, [characterId]);

  useEffect(() => {
    let isSubscribed = true;

    void loadAnimation(characterId, request.action)
      .then((data) => {
        if (!isSubscribed) return;

        setNext({
          ...request,
          key: `${characterId}-${request.action}-${request.id}`,
          data,
        });
      })
      .catch((error) => {
        if (isSubscribed) {
          console.error("캐릭터 애니메이션을 불러오지 못했습니다.", error);
          setHasLoadError(true);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [characterId, request]);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(paintFrameRef.current);
      window.cancelAnimationFrame(swapFrameRef.current);
    },
    [],
  );

  if (hasLoadError) {
    return <CharacterError />;
  }

  return (
    <CharacterButton
      type="button"
      aria-label="캐릭터와 상호작용하기"
      onClick={handleInteraction}
    >
      {[current, next].map((playback) =>
        playback ? (
          <Lottie
            key={playback.key}
            src={playback.data}
            loop={playback.loop}
            autoplay
            subscriptions={{
              complete: () => handleComplete(playback),
              frame: () => handleFirstFrame(playback),
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: playback.key === current?.key ? 2 : 1,
            }}
          />
        ) : null,
      )}
    </CharacterButton>
  );
};

const CharacterError = () => (
  <CharacterErrorContainer role="alert">
    <CharacterErrorTitle>캐릭터를 불러오지 못했어요.</CharacterErrorTitle>
    <CharacterErrorDescription>
      잠시 후 다시 시도해주세요.
    </CharacterErrorDescription>
    <Button
      variant="primary"
      size="small"
      label="다시 시도"
      onClick={() => window.location.reload()}
    />
  </CharacterErrorContainer>
);

const CharacterButton = styled.button`
  position: relative;
  display: block;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const CharacterErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
`;

const CharacterErrorTitle = styled.strong`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.md2};
  white-space: nowrap;
`;

const CharacterErrorDescription = styled.p`
  margin: 0;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;
