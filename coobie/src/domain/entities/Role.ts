export class Role {
  private _id: string;
  private _roleName: string;

  constructor(id: string, roleName: string) {
    this._id = id;
    this._roleName = roleName;
  }

  get id(): string {
    return this._id;
  }

  get roleName(): string {
    return this._roleName;
  }

  public static isAdmin(roleId: string): boolean {
    return roleId === "01";
  }

  public static isUser(roleId: string): boolean {
    return roleId === "02";
  }

  public static isRootAdmin(roleId: string): boolean {
    return roleId === "00";
  }
}