import type { Transition, Variants } from "motion/react";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const motionTransition: Transition = { duration: 0.45, ease: premiumEase };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: motionTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: motionTransition },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const scaleOnHover = { scale: 1.015 };

export const drawerTransition: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: motionTransition },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.25, ease: premiumEase } },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: motionTransition },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.2, ease: premiumEase } },
};
