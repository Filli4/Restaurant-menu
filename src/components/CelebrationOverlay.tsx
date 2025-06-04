// components/CelebrationOverlay.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';

interface CelebrationOverlayProps {
  show: boolean;
  /** Duration for the bottom-to-top disappearance animation in milliseconds. */
  disappearDuration?: number;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  show,
  disappearDuration = 1500, // Default 1.5 seconds for the disappearance wipe
}) => {
  // Stores the full intended size of the canvas (full width, 90% height)
  const [baseCanvasSize, setBaseCanvasSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Stores the current animated height of the confetti canvas
  const [animatedCanvasHeight, setAnimatedCanvasHeight] = useState<number>(0);

  // Tracks if the disappearance animation is currently active
  const [isDisappearing, setIsDisappearing] = useState<boolean>(false);

  const animationFrameId = useRef<number | null>(null);

  // Effect to handle window resizing
  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined') {
        const newBaseHeight = window.innerHeight * 0.5;
        const newBaseWidth = window.innerWidth;
        setBaseCanvasSize({
          width: newBaseWidth,
          height: newBaseHeight,
        });

        // If confetti is currently supposed to be fully visible (not in disappearance phase),
        // update its animated height to the new base height.
        if (show && !isDisappearing) {
          setAnimatedCanvasHeight(newBaseHeight);
        }
        // If it's disappearing, the animation continues based on the height it started with.
        // For a more complex resize handling during disappearance, the animation logic would need adjustments.
      }
    }

    handleResize(); // Set initial size
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [show, isDisappearing]); // Rerun on show/isDisappearing to ensure correct height setting

  // Effect to manage showing confetti and the disappearance animation
  useEffect(() => {
    // Always cancel any previous animation frame when show state or base size changes
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (show) {
      setIsDisappearing(false); // Not disappearing when shown
      // Set to full base height if baseCanvasSize is populated
      if (baseCanvasSize.width > 0 && baseCanvasSize.height > 0) {
        setAnimatedCanvasHeight(baseCanvasSize.height);
      }
    } else {
      // When 'show' becomes false, start the disappearance animation
      // Only animate if there's a positive height to animate from.
      if (animatedCanvasHeight > 0 && baseCanvasSize.height > 0) {
        setIsDisappearing(true);
        const startTime = performance.now();
        // Capture the height from which the disappearance starts
        const initialHeightForDisappearance = animatedCanvasHeight;

        const animateDisappear = (currentTime: number) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / disappearDuration, 1); // Progress from 0 to 1

          // Decrease height from initialHeightForDisappearance down to 0
          const newHeight = initialHeightForDisappearance * (1 - progress);
          setAnimatedCanvasHeight(newHeight);

          if (progress < 1) {
            animationFrameId.current = requestAnimationFrame(animateDisappear);
          } else {
            setAnimatedCanvasHeight(0); // Ensure it ends precisely at 0
            setIsDisappearing(false);   // Disappearance animation finished
            animationFrameId.current = null;
          }
        };
        animationFrameId.current = requestAnimationFrame(animateDisappear);
      } else {
        // If 'show' is false and there's no height to animate (or already 0), ensure it's 0
        setAnimatedCanvasHeight(0);
        setIsDisappearing(false);
      }
    }

    // Cleanup animation frame on component unmount or if dependencies change
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [show, baseCanvasSize, disappearDuration, animatedCanvasHeight]); // animatedCanvasHeight added to correctly trigger disappearance from current height

  // Determine if the confetti component should be rendered
  // Render if 'show' is true (actively showing),
  // OR if 'isDisappearing' is true and there's still some height to animate.
  // Also ensure baseCanvasSize.width is available.
  const shouldRender = (show || (isDisappearing && animatedCanvasHeight > 0)) && baseCanvasSize.width > 0;

  if (!shouldRender) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      <Confetti
        width={baseCanvasSize.width}
        height={animatedCanvasHeight} // CRITICAL: Use the animated height here
        recycle={show}                // Only emit new pieces when 'show' is true
        numberOfPieces={show ? 500 : 0} // Control emission based on 'show'
        gravity={0.40}                // User-provided value (Note: this is high gravity, pieces fall fast)
        initialVelocityX={{ min: -7, max: 7 }}
        initialVelocityY={{ min: -15, max: -5 }}
        tweenDuration={8000}
        wind={0.05}                   // User-provided value (Note: this is a noticeable wind)
        colors={['#FFC700', '#FF0000', '#2E3192', '#44C4A1', '#F9A8D4']}
      />
    </div>
  );
};

export default CelebrationOverlay;