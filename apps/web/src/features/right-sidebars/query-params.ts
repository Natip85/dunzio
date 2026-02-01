"use client";

import { useParams } from "next/navigation";
import { createSerializer, useQueryStates } from "nuqs";
import { parseAsBoolean, parseAsString } from "nuqs/server";

import { useSidebar } from "./right-sidebar";

type Sidebars = "filterOpen" | "filterSaving" | "infoId" | "downloadList";

export const sidebarParamsParser = {
  filterOpen: parseAsString,
  filterSaving: parseAsBoolean.withDefault(false),
  infoId: parseAsString,
  downloadList: parseAsBoolean.withDefault(false),
};

const emptySidebarParams: Record<Sidebars, null> = {
  filterOpen: null,
  filterSaving: null,
  infoId: null,
  downloadList: null,
};

export const sidebarParamsSerializer = createSerializer(sidebarParamsParser);

export const useSidebarParams = () => {
  const [sidebarParams, setSidebarParams] = useQueryStates(sidebarParamsParser);
  const { setOpen, setOpenMobile, isMobile } = useSidebar("right");
  const params = useParams();
  const paramsSmartListId = params.smartListId as string;
  const aiSmartListId = params.aiSmartListId as string;

  // Helper to set the correct sidebar state based on device
  const setSidebarOpen = (open: boolean) => {
    if (isMobile) {
      setOpenMobile(open);
    } else {
      setOpen(open);
    }
  };

  const toggleFilterOpen = (filter = "new") => {
    void setSidebarParams((prev) => {
      const filterOpen = prev.filterOpen === filter ? null : filter;
      setSidebarOpen(!!filterOpen);
      return {
        ...emptySidebarParams,
        filterOpen,
      };
    });
  };

  const toggleFilterSaving = () => {
    void setSidebarParams((prev) => {
      const filterSaving = !prev.filterSaving || null;
      setSidebarOpen(!!filterSaving);
      return {
        ...emptySidebarParams,
        filterSaving,
      };
    });
  };

  const toggleDownloadList = (open?: boolean) => {
    void setSidebarParams((prev) => {
      const downloadList = open ?? (!prev.downloadList || null);
      setSidebarOpen(!!downloadList);
      return {
        ...emptySidebarParams,
        downloadList,
      };
    });
  };

  const toggleInfoSidebarId = (id: string) => {
    void setSidebarParams((prev) => {
      const infoId = prev.infoId === id ? null : id;
      setSidebarOpen(!!infoId);
      return {
        ...emptySidebarParams,
        infoId,
      };
    });
  };

  const setFilterOpenId = (newFilterOpen: string) => {
    void setSidebarParams((prev) => {
      const filterOpen = prev.filterOpen === newFilterOpen ? null : newFilterOpen;
      setSidebarOpen(!!filterOpen);
      return {
        ...emptySidebarParams,
        filterOpen,
      };
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    void setSidebarParams(null);
  };

  const getSmartListId = () => {
    if (!sidebarParams.filterOpen) return;
    if (sidebarParams.filterOpen === "new") return;
    if (sidebarParams.filterOpen === "edit") return paramsSmartListId;
    return sidebarParams.filterOpen;
  };

  return {
    sidebarParams,
    smartListId: getSmartListId(),
    aiSmartListId,
    toggleFilterSaving,
    toggleFilterOpen,
    toggleInfoSidebarId,
    toggleDownloadList,
    setFilterOpenId,
    setSidebarParams,
    closeSidebar,
  };
};
