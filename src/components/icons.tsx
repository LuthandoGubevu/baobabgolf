import type { SVGProps } from "react";
import Image from "next/image";

export const GolfBallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <pattern id="dimples" patternUnits="userSpaceOnUse" width="10" height="10">
        <circle cx="5" cy="5" r="1.5" fill="rgba(0,0,0,0.08)" />
      </pattern>
    </defs>
    <circle cx="50" cy="50" r="48" fill="white" />
    <circle cx="50" cy="50" r="48" fill="url(#dimples)" />
  </svg>
);

export const HopeLogo = (props: SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="12" fill="#E4002B"/>
        <path d="M24.5 20H39.5V23H34V44H30V23H24.5V20Z" fill="white"/>
        <path d="M10 20L18 29V44H14V31L7.5 24V20H10Z" fill="white"/>
        <path d="M54 20L46 29V44H50V31L56.5 24V20H54Z" fill="white"/>
    </svg>
);


export const Logo = ({ className }: { className?: string }) => (
    <Image src="/logo.png" alt="Baobab Golf Logo" width={210} height={40} className={className} />
);