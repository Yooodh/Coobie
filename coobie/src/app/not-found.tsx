// src/app/not-found.tsx
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="bg-[#F7E3BF] h-screen w-full overflow-hidden relative">
      <div className="absolute -top-8 left-4">
        <Link href="/">
          <Image
            src="/images/Coobie_logo.png"
            alt="Coobie Logo"
            width={150}
            height={60}
            priority
          />
        </Link>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/images/Coobie_404_NotFound.png"
          alt="404 Not Found"
          width={500}
          height={400}
          priority
        />
      </div>
    </div>
  );
}
