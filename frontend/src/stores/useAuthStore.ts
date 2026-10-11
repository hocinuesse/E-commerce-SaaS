import { create } from "zustand";
import { UserRole, User, AuthState } from "@/interfaces/IUserStore";

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  shop: null,

  setUser: (user) => set({ user }),
  setShop: (shop: any | null) => set({ shop }),
  logout: () => set({ user: null, shop: null }),
}));

export { useAuthStore };
