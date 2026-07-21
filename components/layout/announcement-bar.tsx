"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { announcement } from "@/constants/storefront";
import { IconButton } from "@/components/shared/icon-button";

const storageKey = `announcement:${announcement.id}`;
const changeEvent = "maison-announcement-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(storageKey) !== "closed";
}

export function AnnouncementBar() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, () => true);

  function closeAnnouncement() {
    window.localStorage.setItem(storageKey, "closed");
    window.dispatchEvent(new Event(changeEvent));
  }

  return (
    <AnimatePresence initial={false}>
      {isVisible ? (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="relative flex min-h-9 items-center justify-center px-12 py-2 text-center text-[0.6875rem] tracking-wide sm:text-xs">
            <p>
              {announcement.message}{" "}
              <Link href={announcement.link.href} prefetch={false} className="ml-1 font-semibold underline underline-offset-4 hover:text-accent">
                {announcement.link.label}
              </Link>
            </p>
            <IconButton
              aria-label="Close announcement"
              onClick={closeAnnouncement}
              variant="ghost"
              size="icon-xs"
              className="absolute right-3 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <XIcon aria-hidden />
            </IconButton>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
