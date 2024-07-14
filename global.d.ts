import "next-auth";
import { type AdapterUser as DefaultAdapterUser } from "next-auth/adapters";

declare module "next-auth/adapters" {
  export interface AdapterUser extends DefaultAdapterUser {
    id: number;
    isSuperAdmin: Boolean;
    name: string;
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    id: number;
    isSuperAdmin: Boolean;
    name: string;
  }
}

declare module "next-auth" {
  export interface Session {
    user: { id: number; name: string; isSuperAdmin: Boolean } | undefined;
  }

  export interface User {
    id: number;
    isSuperAdmin: Boolean;
    name: string;
  }

  export interface JWT {
    id: number;
    isSuperAdmin: Boolean;
    name: string;
  }
}
