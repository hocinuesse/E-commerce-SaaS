export enum UserRole {
  ADMIN = "admin",
  VENDOR = "vendor",
  CLIENT = "client",
  MANAGER = "manager",
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shopId?: string;
  vendorInfo?: {
    storeName: string;
    commercialRegister: string;
    isVerified?: boolean;
  };
}

interface AuthState {
  user: User | null;
  shop: any | null;
  setUser: (user: User | null) => void;
  setShop: (shop: any | null) => void;
  logout: () => void;
}

export type { User, AuthState };
