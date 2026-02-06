"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { BoardSkeleton } from "@/features/loaders/board-skeleton";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list";

type ListRendererContextType = {
  hasData: boolean;
  isLoading: boolean;
  hasSearch: boolean;
  viewMode: ViewMode;
  limit?: number;
};

const ListRendererContext = createContext<ListRendererContextType | null>(null);

function useListRendererContext() {
  const context = useContext(ListRendererContext);
  if (!context) {
    throw new Error("ListRenderer compound components must be used within ListRenderer");
  }
  return context;
}

type ListRendererProps = {
  hasData: boolean;
  isLoading: boolean;
  hasSearch: boolean;
  viewMode: ViewMode;
  limit?: number;
  children: ReactNode;
};

export function ListRenderer({
  hasData,
  isLoading,
  hasSearch,
  viewMode,
  limit,
  children,
}: ListRendererProps) {
  return (
    <ListRendererContext.Provider value={{ hasData, isLoading, hasSearch, viewMode, limit }}>
      {children}
    </ListRendererContext.Provider>
  );
}

type ListRendererChildProps = {
  children?: ReactNode;
};

export function ListRendererLoading({ children }: ListRendererChildProps) {
  const { isLoading, viewMode, limit } = useListRendererContext();

  if (!isLoading) return null;

  if (children) {
    return <>{children}</>;
  }

  return (
    <BoardSkeleton
      viewMode={viewMode}
      limit={limit}
    />
  );
}

export function ListRendererEmpty({ children }: ListRendererChildProps) {
  const { hasData, isLoading, hasSearch } = useListRendererContext();

  if (isLoading || hasData || hasSearch) return null;

  return <>{children}</>;
}

export function ListRendererNoResults({ children }: ListRendererChildProps) {
  const { hasData, isLoading, hasSearch } = useListRendererContext();

  if (isLoading || hasData || !hasSearch) return null;

  return <>{children}</>;
}

export function ListRendererList({
  children,
  className,
  ...props
}: ListRendererChildProps & React.HTMLAttributes<HTMLDivElement>) {
  const { hasData, isLoading } = useListRendererContext();

  if (isLoading || !hasData) return null;

  return (
    <div
      {...props}
      className={cn("", className)}
    >
      {children}
    </div>
  );
}

export type ListRendererViewType = "kanban" | "list";

type ListRendererListItemProps = {
  type: ListRendererViewType | ListRendererViewType[];
  children: ReactNode;
};
export function ListRendererListItem({ type, children }: ListRendererListItemProps) {
  const { viewMode } = useListRendererContext();

  if (Array.isArray(type) ? !type.includes(viewMode) : viewMode !== type) return null;

  return <>{children}</>;
}
