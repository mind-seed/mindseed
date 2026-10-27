import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { Button } from "./Button";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import {
  getCharacterAnimations,
  type CharacterAssetId,
  type CharacterAction,
  type CharacterAnimations,
} from "../constants/character";

export type CharacterProps = {
  characterIndex: number;
};

type AnimationData = {
  assets?: { p?: string; u?: string; e?: number; [key: string]: unknown }[];
  [key: string]: unknown;
};

type LoadedCharacter = {
  animations: Map<CharacterAction, AnimationData>;
  images: Map<string, Uint8Array>;
};

const characterLoads = new Map<CharacterAssetId, Promise<LoadedCharacter>>();

const loadCharacter = (config: CharacterAnimations) => {
  const cached = characterLoads.get(config.assetId);
  if (cached) return cached;

  const request = (async () => {
    const actions = [
      ...new Set([
        config.default.idle,
        config.default.blinking,
        ...config.interaction,
      ]),
    ];
    const animations = new Map<CharacterAction, AnimationData>();
    const imagePaths = new Set<string>();
    await Promise.all(
      actions.map(async (action) => {
        const response = await fetch(
          `/lottie/${config.assetId}/${action}.json`,
        );
        if (!response.ok) {
          throw new Error(
            `Animation request failed: ${response.status} (${action})`,
          );
        }
        const data: AnimationData = await response.json();
        for (const asset of data.assets ?? []) {
          if (!asset.p) continue;
          asset.u = `/lottie/${config.assetId}/images/`;
          asset.e = 0;
          imagePaths.add(`${asset.u}${asset.p}`);
        }
        animations.set(action, data);
      }),
    );

    const images = new Map<string, Uint8Array>();
    await Promise.all(
      [...imagePaths].map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Image request failed: ${response.status} (${path})`);
        }
        images.set(path, new Uint8Array(await response.arrayBuffer()));
      }),
    );
    return { animations, images };
  })();

  characterLoads.set(config.assetId, request);
  void request.catch(() => characterLoads.delete(config.assetId));
  return request;
};

export const Character = ({ characterIndex }: CharacterProps) => {
  const animations = getCharacterAnimations(characterIndex);

  if (!animations) {
    return <CharacterError />;
  }

  return <CharacterPlayer key={animations.assetId} animations={animations} />;
};

const CharacterPlayer = ({
  animations,
}: {
  animations: CharacterAnimations;
}) => {
  const { idle, blinking } = animations.default;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingActionRef = useRef<CharacterAction | null>(null);
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [action, setAction] = useState<CharacterAction>(idle);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    if (hasLoadError || !canvasRef.current) return;

    const instance = new DotLottie({ canvas: canvasRef.current });
    instance.addEventListener("ready", () => setPlayer(instance));
    instance.addEventListener("complete", () =>
      setAction((current) =>
        current !== playingActionRef.current
          ? current
          : current === idle
            ? blinking
            : idle,
      ),
    );
    instance.addEventListener("loadError", () => setHasLoadError(true));
    return () => instance.destroy();
  }, [idle, blinking, hasLoadError]);

  useEffect(() => {
    if (!player || hasLoadError) return;

    let cancelled = false;
    void loadCharacter(animations)
      .then(({ animations: dataByAction, images }) => {
        if (cancelled) return;
        const data = dataByAction.get(action);
        if (!data) throw new Error(`Animation not found: ${action}`);
        player.pause();
        playingActionRef.current = action;
        player.load({
          data: JSON.stringify(data),
          assetResolver: (src) => images.get(src.replace(/^\/+/, "/")) ?? null,
          loop: action === idle,
          loopCount: action === idle ? 1 + Math.floor(Math.random() * 2) : 0,
          autoplay: true,
        });
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("캐릭터 애니메이션을 불러오지 못했습니다.", error);
          setHasLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [player, animations, action, idle, hasLoadError]);

  const handleInteraction = () => {
    const actions = animations.interaction;
    if (
      !player?.isLoaded ||
      playingActionRef.current !== action ||
      (action !== idle && action !== blinking) ||
      !actions.length
    )
      return;
    setAction(actions[Math.floor(Math.random() * actions.length)]);
  };

  if (hasLoadError) return <CharacterError />;

  return (
    <CharacterButton
      type="button"
      aria-label="캐릭터와 상호작용하기"
      onClick={handleInteraction}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
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
