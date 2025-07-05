
<div align="center">

<div align="center">
  <img src="https://github.com/user-attachments/assets/28953591-41c6-4875-b67c-5e42e3ebfc3c" width="300" />
  <p><i>언제 어디서나 팀과 연결되세요.</i></p>
</div>

## 📋 개요
Coobie(쿠비)는 기업이 직원의 상태와 스케줄을 추적하고 내부 커뮤니케이션을 간소화할 수 있는 종합적인 업무 공간 관리 시스템입니다. Coobie를 통해 실시간으로 누가 자리에 있고, 누가 회의 중이며, 누가 원격으로 일하고 있는지 한눈에 확인할 수 있습니다.

### 주요 기능

🟢 실시간 상태 업데이트: 동료의 가용성을 한 눈에 확인
📅 일정 관리: 팀원과 일정 계획 및 공유
💬 인스턴트 메시징: 팀과 효율적으로 소통
👥 팀 조직: 부서 및 직급을 쉽게 관리
🔄 동기화: 모든 디바이스에서 실시간 업데이트

### 🔧 기술 스택

프론트엔드: Next.js, React, TypeScript
스타일링: SCSS
상태 관리: Zustand, React Query
백엔드 & 데이터베이스: Supabase
인증: JWT

### 🚀 시작하기
사전 요구사항

Node.js 18.x 이상
npm 또는 yarn

#### 설치 방법

1. 레포지토리 클론하기:
```
bashgit clone https://github.com/your-username/coobie.git
cd coobie
```

2. 의존성 설치:
``` bash
bashnpm install
// 또는
yarn install
```

3. 환경 변수 설정:
```
# .env.local 파일을 생성하고 다음 변수들을 추가하세요
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
개발 서버 실행:
```
bashnpm run dev
# 또는
yarn dev
```

브라우저에서 URL 을 열어 애플리케이션을 확인하세요.

🏗️ 프로젝트 구조

coobie/  
├── src/  
│   ├── app/                  # Next.js 앱 라우터  
│   ├── components/           # 재사용 가능한 UI 컴포넌트  
│   ├── hooks/                # 커스텀 React 훅  
│   ├── lib/                  # 유틸리티 및 헬퍼 함수  
│   ├── services/             # API 서비스 레이어  
│   ├── store/                # Zustand 스토어  
│   ├── styles/               # SCSS 스타일  
│   └── types/                # TypeScript 타입 정의  
├── public/                   # 정적 에셋  
└── ... (설정 파일들)  

### 👥 사용자 역할
루트 관리자

회사 등록 승인
회사 계정 관리
잠긴 회사 계정 초기화

회사 관리자

직원 계정 등록 및 관리
부서 및 직급 구성
직원 비밀번호 초기화

직원

개인 상태 업데이트
개인 일정 관리
동료의 상태 및 일정 확인
팀원과 커뮤니케이션

### 📝 라이센스
이 프로젝트는 MIT 라이센스를 따릅니다 - 자세한 내용은 LICENSE 파일을 참고하세요.
🤝 기여하기
기여는 오픈소스 커뮤니티를 학습, 영감, 창작의 놀라운 장소로 만듭니다. 여러분의 모든 기여는 매우 감사합니다.

프로젝트를 포크하세요
기능 브랜치를 생성하세요 (git checkout -b feature/멋진기능)
변경사항을 커밋하세요 (git commit -m '멋진 기능 추가')
브랜치에 푸시하세요 (git push origin feature/멋진기능)
Pull Request를 열어주세요

📞 연락처
프로젝트 링크: https://github.com/FRONT-END-BOOTCAMP-PULS-4/Coobie

<div align="center">
  <p>쿠비 팀이 ❤️를 담아 만들었습니다</p>
</div>
