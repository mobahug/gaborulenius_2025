import React from "react";

type DeferredSectionHeights = {
  desktop: number | string;
  mobile: number | string;
  tablet: number | string;
};

type DeferredSectionProps = {
  children: React.ReactNode;
  id: string;
  innerRef?: React.Ref<HTMLDivElement>;
  minHeights: DeferredSectionHeights;
};

const getMinHeight = (width: number, heights: DeferredSectionHeights) => {
  if (width < 600) {
    return heights.mobile;
  }

  if (width < 900) {
    return heights.tablet;
  }

  return heights.desktop;
};

export const DeferredSection = ({
  children,
  id,
  innerRef,
  minHeights,
}: DeferredSectionProps) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [minHeight, setMinHeight] = React.useState(() =>
    getMinHeight(
      typeof window === "undefined" ? 1024 : window.innerWidth,
      minHeights,
    ),
  );

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;

      if (typeof innerRef === "function") {
        innerRef(node);
      } else if (innerRef) {
        (innerRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [innerRef],
  );

  React.useEffect(() => {
    const updateMinHeight = () => {
      setMinHeight(getMinHeight(window.innerWidth, minHeights));
    };

    window.addEventListener("resize", updateMinHeight);

    return () => {
      window.removeEventListener("resize", updateMinHeight);
    };
  }, [minHeights]);

  React.useEffect(() => {
    const loadIfTargeted = () => {
      if (window.location.hash === `#${id}`) {
        setShouldLoad(true);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor?.hash === `#${id}`) {
        setShouldLoad(true);
      }
    };

    loadIfTargeted();
    window.addEventListener("hashchange", loadIfTargeted);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("hashchange", loadIfTargeted);
      document.removeEventListener("click", onClick, true);
    };
  }, [id]);

  React.useEffect(() => {
    if (shouldLoad || !localRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px", threshold: 0 },
    );

    observer.observe(localRef.current);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div
      id={id}
      ref={setRefs}
      data-deferred-section={id}
      style={{ minHeight: shouldLoad ? undefined : minHeight, width: "100%" }}
    >
      {shouldLoad ? (
        <React.Suspense fallback={null}>{children}</React.Suspense>
      ) : null}
    </div>
  );
};
