import { Fredoka, Quicksand } from "next/font/google";

/** Display font — chunky & rounded, for headings and the logo. */
export const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Body font — clean rounded geometric. */
export const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontVariables = `${fredoka.variable} ${quicksand.variable}`;
