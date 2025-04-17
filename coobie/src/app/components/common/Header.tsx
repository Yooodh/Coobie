import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  username?: string;
}

export default function Header({ username = "User" }: HeaderProps) {
  return (
    <header className="w-full bg-white py-4">
      <div className="flex items-center justify-between mx-8 md:mx-12 lg:mx-16">
        {/* 로고 - 왼쪽 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/Coobie_logo.png"
            alt="Coobie Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* 사용자 환영 메시지 - 오른쪽 */}
        <div className="flex items-center mr-4 md:mr-6 lg:mr-8">
          <p className="text-gray-700 mr-2">반갑습니다</p>
          <Link href="/mypage" className="font-medium text-amber-500 hover:text-amber-600 transition-colors">
            {username}님
          </Link>
        </div>
      </div>
    </header>
  );
}