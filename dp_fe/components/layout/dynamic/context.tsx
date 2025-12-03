"use client";

import {
  ReactNode,
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export type HToolbarContextType = {
  setHorizontalToolbarActions: (children: ReactNode) => void;
};

export type VToolbarContextType = {
  setVerticalToolbarActions: (children: ReactNode) => void;
};

export type MainMenuContextType = {
  setMainMenubarActions: (children: ReactNode) => void;
};

export type LayoutContextType = {
  setHorizontalToolbarActions: (children: ReactNode) => void;
  setVerticalToolbarActions: (children: ReactNode) => void;
  setMainMenubarActions: (children: ReactNode) => void;
  setSidebarActions: (children: ReactNode) => void;
  
  setShowMainMenu: Dispatch<SetStateAction<boolean>>;
  setShowHorizontalToolbar: Dispatch<SetStateAction<boolean>>;
  setShowVerticalToolbar: Dispatch<SetStateAction<boolean>>;
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  
  setMainAreaProps: Dispatch<
    SetStateAction<React.ComponentPropsWithoutRef<typeof ScrollArea>>
  >;
};

export const LayoutContext = createContext<LayoutContextType | null>(null);

export const useInnerLayoutControls = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error(
      "useInnerLayoutControls must be used within a InnerLayout"
    );
  }

  return context;
};
