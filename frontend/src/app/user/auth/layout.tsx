// src/app/(auth)/layout.tsx
// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-200">
      <main className="flex-grow flex items-center justify-center p-4 w-full">
        {children}
      </main>
    </div>
  );
}