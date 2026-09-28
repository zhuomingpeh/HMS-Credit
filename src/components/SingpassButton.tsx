import Image from "next/image";

export function SingpassButton({ href = "/api/auth/singpass/start" }: { href?: string }) {
  return <a href={href} className="singpass-button" aria-label="Apply with Sing-pass">
    <Image src="/brand/apply-with-singpass.svg" width={192} height={44} alt="Apply with Singpass" unoptimized />
  </a>;
}
