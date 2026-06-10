import { createContext, useContext } from "react";

export type RsvpModalContextValue = {
  openRsvp: () => void;
  closeRsvp: () => void;
};

export const RsvpModalContext = createContext<RsvpModalContextValue | null>(null);

export function useRsvpModal() {
  const value = useContext(RsvpModalContext);
  if (!value) {
    throw new Error("useRsvpModal must be used within RsvpModalProvider.");
  }
  return value;
}
