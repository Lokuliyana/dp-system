"use client";

import { useState, useEffect } from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
  role?: { name?: string; _id?: string };
  status: "active" | "inactive";
  lastActive?: string;
  assigned_forms?: any[];
};

const MOCK_USERS: User[] = Array.from({ length: 50 }).map((_, i) => ({
  _id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: { _id: "role-1", name: i % 3 === 0 ? "Admin" : "Teacher" },
  status: i % 5 === 0 ? "inactive" : "active",
  lastActive: new Date().toISOString(),
  assigned_forms: [],
}));

export function usePaginateUsers({
  currentPageIndex,
  dataPerPage,
  search,
  role,
}: {
  currentPageIndex: number;
  dataPerPage: number;
  search?: string;
  role?: string;
}) {
  const [data, setData] = useState<{
    data: User[];
    meta: { total: number; page: number; limit: number };
  }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...MOCK_USERS];
      
      if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower)
        );
      }

      const start = (currentPageIndex - 1) * dataPerPage;
      const end = start + dataPerPage;
      const paginated = filtered.slice(start, end);

      setData({
        data: paginated,
        meta: {
          total: filtered.length,
          page: currentPageIndex,
          limit: dataPerPage,
        },
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPageIndex, dataPerPage, search, role]);

  return { data, isLoading, refetch: () => {} };
}

export function useGetUserById(id: string) {
  const [data, setData] = useState<{ data: User }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const user = MOCK_USERS.find((u) => u._id === id);
      if (user) {
        setData({ data: user });
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  return { data, isLoading };
}

export function useLiveSearchRoles() {
  const [data, setData] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = (query: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setData([
        { _id: "role-1", name: "Admin" },
        { _id: "role-2", name: "Teacher" },
        { _id: "role-3", name: "Student" },
      ]);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    search("");
  }, []);

  return { data, search, isLoading };
}
