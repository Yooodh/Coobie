<div align="center">

<img src="https://github.com/user-attachments/assets/28953591-41c6-4875-b67c-5e42e3ebfc3c" width="300" />
<p><i>언제 어디서나 팀과 연결되세요.</i></p>

**Coobie(쿠비)** 는 기업이 직원의 상태와 스케줄을 추적하고 내부 커뮤니케이션을 간소화할 수 있는 종합적인 업무 공간 관리 시스템입니다. 

Coobie를 통해 실시간으로 누가 자리에 있고, 누가 회의 중이며, 누가 원격으로 일하고 있는지 한눈에 확인할 수 있습니다.

</div>

## 주요 기능

### 🟢 실시간 상태 관리
- 직원의 현재 상태(온라인/오프라인/바쁨/자리비움) 실시간 업데이트
- 동료의 가용성을 한눈에 확인

### 📅 일정 관리
- 개인 및 팀 일정 생성 및 관리
- 일정 카테고리별 분류 및 색상 구분
- 드래그 앤 드롭으로 일정 이동
- 팀원 일정 공유 및 확인

### 👥 조직 관리
- 부서 및 직급 체계 관리
- 사용자 계정 관리 및 권한 설정
- 프로필 이미지 업로드 및 관리

### 🔐 보안 및 인증
- JWT 기반 인증 시스템
- 역할 기반 접근 제어(RBAC)
- 계정 잠금 메커니즘(5회 실패 시)
- 비밀번호 초기화 기능

## 사용자 역할

### 루트 관리자
- 회사 등록 승인/거부
- 회사 계정 관리 및 잠금 해제
- 회사 비밀번호 초기화
- 전체 시스템 관리

### 회사 관리자
- 직원 계정 등록 및 관리
- 부서 및 직급 구성
- 직원 비밀번호 초기화
- 계정 잠금 해제
- 사용자 상태 모니터링

### 일반 사용자
- 개인 상태 업데이트 (온라인/오프라인/바쁨/자리비움)
- 개인 일정 생성 및 관리
- 동료의 상태 및 일정 확인
- 팀원과 실시간 채팅
- 프로필 이미지 업로드

## 기술 스택

### 💻 Frontend
- **Framework**: Next.js 15.3.0 (App Router)
- **Language**: TypeScript 5.0
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.1.4
- **UI Components**: 
  - react-dnd 16.0.1 (드래그 앤 드롭)
  - react-rnd 10.5.2 (리사이즈 가능한 컴포넌트)
  - react-toastify 11.0.5 (알림 메시지)
  - swiper 11.2.6 (슬라이더)

### ⚙️ Backend
- **Runtime**: Node.js
- **BaaS**: Supabase 2.49.4
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (jsonwebtoken 9.0.2, jose 6.0.10)
- **File Storage**: Supabase Storage (프로필 이미지)
- **SSR Support**: @supabase/ssr 0.6.1

### 🛠️ Development Tools
- **Linter**: ESLint 9
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)

<div align="center">

 ## Team Coobie
  <table>
      <tr>
       <td align="center"><a href="https://github.com/Yooodh"><img src=https://avatars.githubusercontent.com/u/93702328?v=4 width="50px;" alt=""/><br /><sub><b>@Yo_o.</b></sub></a><br /></td>
       <td align="center"><a href="https://github.com/DKULena/"><img src=https://avatars.githubusercontent.com/u/115008048?v=4 width="50px;" alt=""/><br /><sub><b>@medioloper</b></sub></a><br /></td>
       <td align="center"><a href="https://github.com/mjhn010"><img src=https://avatars.githubusercontent.com/u/120008573?v=4 width="50px;" alt=""/><br /><sub><b>@jun Y</b></sub></a><br /></td>      
      </tr>
       <td align="center">유대현</td>
       <td align="center">이성재</td>
       <td align="center">윤준영</td>
     </tr>
  </table>
 
</div>
