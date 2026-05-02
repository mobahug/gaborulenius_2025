import { useCallback, useEffect, useRef, type RefObject } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";

export const activeSectionIdAtom = atom<string>("#home");
type RequestedSection = {
  expiresAt: number;
  id: string;
};

const requestedSectionIdAtom = atom<RequestedSection | null>(null);
const NAV_ACTIVATION_OFFSET_RATIO = 0.35;
const REQUESTED_SECTION_TIMEOUT_MS = 3000;
const SCROLL_END_THRESHOLD_PX = 2;

const normalizeSectionHash = (sectionId: string) =>
  sectionId.startsWith("#") ? sectionId : `#${sectionId}`;

const getSectionHash = (section: HTMLElement) => `#${section.id}`;

export const useActiveNavLink = () => {
  const currentActiveSectionId = useAtomValue(activeSectionIdAtom);
  const requestedSection = useAtomValue(requestedSectionIdAtom);
  const setActiveSectionId = useSetAtom(activeSectionIdAtom);
  const setRequestedSectionId = useSetAtom(requestedSectionIdAtom);

  const updateActiveSectionId = useCallback(
    (sectionId: string) => {
      setActiveSectionId(normalizeSectionHash(sectionId));
    },
    [setActiveSectionId],
  );

  const requestActiveSection = useCallback(
    (sectionId: string) => {
      const nextSectionId = normalizeSectionHash(sectionId);

      setRequestedSectionId({
        expiresAt: Date.now() + REQUESTED_SECTION_TIMEOUT_MS,
        id: nextSectionId,
      });
      setActiveSectionId(nextSectionId);
    },
    [setActiveSectionId, setRequestedSectionId],
  );

  const clearRequestedSectionId = useCallback(
    (sectionId?: string) => {
      const sectionHash = sectionId ? normalizeSectionHash(sectionId) : null;

      setRequestedSectionId((currentSection) => {
        if (sectionHash && currentSection?.id !== sectionHash) {
          return currentSection;
        }

        return null;
      });
    },
    [setRequestedSectionId],
  );

  return {
    currentActiveSectionId,
    requestedSection,
    setActiveSectionId: updateActiveSectionId,
    requestActiveSection,
    clearRequestedSectionId,
  };
};

export const useActiveNavScrollSpy = <TSection extends HTMLElement>(
  sectionRefs: ReadonlyArray<RefObject<TSection>>,
) => {
  const {
    clearRequestedSectionId,
    currentActiveSectionId,
    requestedSection,
    requestActiveSection,
    setActiveSectionId,
  } = useActiveNavLink();
  const activeSectionIdRef = useRef(currentActiveSectionId);
  const requestedSectionRef = useRef(requestedSection);

  useEffect(() => {
    activeSectionIdRef.current = currentActiveSectionId;
  }, [currentActiveSectionId]);

  useEffect(() => {
    requestedSectionRef.current = requestedSection;
  }, [requestedSection]);

  useEffect(() => {
    const observedSections = sectionRefs
      .map((sectionRef) => sectionRef.current)
      .filter((section): section is TSection => Boolean(section));

    if (observedSections.length === 0) {
      return;
    }

    const getActivationOffset = () =>
      window.innerHeight * NAV_ACTIVATION_OFFSET_RATIO;

    const isPageScrolledToEnd = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - SCROLL_END_THRESHOLD_PX;

    const findSectionByHash = (sectionHash: string) =>
      observedSections.find(
        (section) => getSectionHash(section) === sectionHash,
      );

    const getCurrentSection = () => {
      if (isPageScrolledToEnd()) {
        return observedSections[observedSections.length - 1];
      }

      const activationOffset = getActivationOffset();

      return observedSections.reduce((activeSection, section) => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= activationOffset) {
          return section;
        }

        return activeSection;
      }, observedSections[0]);
    };

    const hasReachedRequestedSection = (section: HTMLElement) => {
      const sectionRect = section.getBoundingClientRect();
      const activationOffset = getActivationOffset();
      const lastSection = observedSections[observedSections.length - 1];

      return (
        (sectionRect.top <= activationOffset &&
          sectionRect.bottom > activationOffset) ||
        (getSectionHash(section) === getSectionHash(lastSection) &&
          isPageScrolledToEnd())
      );
    };

    const updateActiveSectionId = (sectionHash: string) => {
      if (activeSectionIdRef.current === sectionHash) {
        return;
      }

      activeSectionIdRef.current = sectionHash;
      setActiveSectionId(sectionHash);
    };

    const updateActiveSection = () => {
      const requestedNavigation = requestedSectionRef.current;
      const requestedHash = requestedNavigation?.id;

      if (requestedHash) {
        const requestedSection = findSectionByHash(requestedHash);

        if (!requestedSection || Date.now() > requestedNavigation.expiresAt) {
          requestedSectionRef.current = null;
          clearRequestedSectionId(requestedHash);
        } else if (!hasReachedRequestedSection(requestedSection)) {
          return;
        } else {
          requestedSectionRef.current = null;
          clearRequestedSectionId(requestedHash);
        }
      }

      updateActiveSectionId(getSectionHash(getCurrentSection()));
    };

    let animationFrameId: number | null = null;

    const requestActiveSectionUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateActiveSection();
      });
    };

    const handleHashChange = () => {
      const sectionHash = window.location.hash;

      if (!sectionHash || !findSectionByHash(sectionHash)) {
        return;
      }

      activeSectionIdRef.current = sectionHash;
      requestedSectionRef.current = {
        expiresAt: Date.now() + REQUESTED_SECTION_TIMEOUT_MS,
        id: sectionHash,
      };
      requestActiveSection(sectionHash);
      requestActiveSectionUpdate();
    };

    handleHashChange();
    requestActiveSectionUpdate();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", requestActiveSectionUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestActiveSectionUpdate);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", requestActiveSectionUpdate);
      window.removeEventListener("resize", requestActiveSectionUpdate);
    };
  }, [
    clearRequestedSectionId,
    requestActiveSection,
    sectionRefs,
    setActiveSectionId,
  ]);
};
