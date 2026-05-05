import React from "react";

type AnimatedRevealProps = {
  children: React.ReactNode;
  className?: string;
  component?: React.ElementType;
  once?: boolean;
  order?: number;
  rootMargin?: string;
  style?: React.CSSProperties;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const AnimatedReveal = ({
  children,
  className,
  component: Component = "div",
  once = true,
  order = 1,
  rootMargin = "0px 0px -10% 0px",
  style,
  ...rest
}: AnimatedRevealProps & Record<string, unknown>) => {
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(prefersReducedMotion);

  React.useEffect(() => {
    if (!node || visible) {
      return;
    }

    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin, threshold: 0.12 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, once, rootMargin, visible]);

  const delayMs = Math.max(0, order) * 200;
  const revealStyle: React.CSSProperties = prefersReducedMotion()
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 30px, 0)",
        transition: `opacity 600ms ease-out ${delayMs}ms, transform 600ms ease-out ${delayMs}ms`,
        willChange: visible ? undefined : "opacity, transform",
      };

  return (
    <Component
      ref={setNode}
      className={className}
      style={{ ...revealStyle, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default AnimatedReveal;
