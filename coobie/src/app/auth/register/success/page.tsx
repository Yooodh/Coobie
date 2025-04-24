// src/app/auth/register/success/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <Image
            src="/images/Coobie_logo.png"
            alt="Coobie Logo"
            width={180}
            height={60}
            priority
          />
        </div>

        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          가입 신청이 완료되었습니다!
        </h2>

        <div className="mt-4 text-md text-gray-600">
          <p className="mb-4">회사 가입 신청이 성공적으로 접수되었습니다.</p>
          <p className="mb-4">
            쿠비 관리자의 승인 후 서비스 이용이 가능합니다. 승인이 완료되면
            별도로 안내드립니다.
          </p>
          <p>
            가입 관련 문의사항은 아래 이메일로 연락주세요.
            <br />
            <a
              href="mailto:support@coobie.com"
              className="text-amber-600 hover:text-amber-500"
            >
              support@coobie.com
            </a>
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
