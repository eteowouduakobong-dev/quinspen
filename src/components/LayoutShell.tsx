"use client";

import React from "react";
import { ListenerSessionModal } from "@/components/ListenerSessionModal";
import { SafeHavenButton } from "@/components/SafeHavenButton";
import { useQuinspen } from "@/context/QuinspenContext";

/** Renders the floating Safe Haven button + listener modal overlay.
 *  Must live inside QuinspenProvider so it can read context. */
export function LayoutShell() {
  const { isListenerModalOpen, closeListenerModal } = useQuinspen();

  return (
    <>
      <SafeHavenButton />
      <ListenerSessionModal
        isOpen={isListenerModalOpen}
        onClose={closeListenerModal}
      />
    </>
  );
}
