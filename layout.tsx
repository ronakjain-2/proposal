import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Anu ❤️",
  description: "A love quiz for Anu — by Ronak.",
};

export default function ValentineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
