import type { JSX } from "react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.9),_rgba(255,255,255,0.92)_42%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_46%,_#fff7ed_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center">
        {children}
      </div>
    </div>
  );
}
