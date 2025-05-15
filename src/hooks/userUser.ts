// hooks/useUser.ts
import { useEffect, useState } from "react";
import { User } from "../types/User";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 실제 API 호출로 교체
    fetch("/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return user;
};
