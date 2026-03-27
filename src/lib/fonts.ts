'use client';

import { DM_Serif_Display, DM_Sans, Inter, Roboto, Poppins, Playfair_Display, Montserrat, Lora, Oswald, Raleway } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const fontClasses = `${dmSerifDisplay.variable} ${dmSans.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable} ${montserrat.variable} ${lora.variable} ${oswald.variable} ${raleway.variable}`;

export const fontVariables = {
  'dm-sans': 'var(--font-body)',
  'dm-serif': 'var(--font-display)',
  'inter': 'var(--font-inter)',
  'roboto': 'var(--font-roboto)',
  'poppins': 'var(--font-poppins)',
  'playfair': 'var(--font-playfair)',
  'montserrat': 'var(--font-montserrat)',
  'lora': 'var(--font-lora)',
  'oswald': 'var(--font-oswald)',
  'raleway': 'var(--font-raleway)',
};
