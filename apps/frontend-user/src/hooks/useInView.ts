import { useCallback, useRef, useState } from "react";

function useInView<T extends HTMLElement>() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isInView, setIsInView] = useState(false);

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();

    if (!node) {
      observerRef.current = null;
      return;
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    });

    observerRef.current.observe(node);
  }, []);

  return { ref, isInView };
}

export default useInView;
