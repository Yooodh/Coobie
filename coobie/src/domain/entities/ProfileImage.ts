// export class ProfileImage {
//   constructor(public userId: string, public fileName: string) {}
// }

// src/domain/entities/ProfileImage.ts

export class ProfileImage {
  constructor(
    public userId: string,
    public fileName: string,
    public filePath: string,
    public fileUrl: string,
    public fileType: string,
    public fileSize: number,
    public createdAt: Date = new Date(),
    public updatedAt?: Date,
    public id?: string,
  ) {}

  /**
   * 이미지 타입 유효성 검사
   * @param mimeType 이미지 MIME 타입
   * @returns 유효성 여부
   */
  static isValidImageType(mimeType: string): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    return allowedTypes.includes(mimeType);
  }

  /**
   * 파일 크기 유효성 검사 (최대 5MB)
   * @param fileSize 파일 크기 (바이트)
   * @returns 유효성 여부
   */
  static isValidFileSize(fileSize: number): boolean {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    return fileSize <= MAX_SIZE;
  }

  /**
   * 파일 확장자 가져오기
   * @returns 파일 확장자
   */
  getFileExtension(): string {
    return this.fileName.split('.').pop() || '';
  }

  /**
   * 파일명에서 타임스탬프 부분 가져오기
   * @returns 타임스탬프 (없으면 null)
   */
  getTimestamp(): number | null {
    const match = this.fileName.match(/-(\d+)\.[^.]+$/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * 파일 이름 생성 (사용자 ID, 타임스탬프, 확장자 기반)
   * @param userId 사용자 ID
   * @param fileType 파일 타입 (MIME 타입)
   * @returns 생성된 파일 이름
   */
  static generateFileName(userId: string, fileType: string): string {
    const timestamp = Date.now();
    const extension = fileType.split('/').pop() || 'jpg';
    return `${userId}-${timestamp}.${extension}`;
  }
}