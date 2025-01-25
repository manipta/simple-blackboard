// import { LocalStorageKeys } from "../constants";
// import { Storage } from "@"

// class _StorageHelper {
//   constructor() {}

//   _set(key: string, value: string) {
//     Storage.setItem(key, value);
//   }

//   _get(key: string) {
//     return localStorage.getItem(key);
//   }

//   saveUserInfo(userInfo: UserInfo) {
//     this._set(LocalStorageKeys.USER_INFO, JSON.stringify(userInfo));
//   }

//   getUserInfo(): UserInfo | null {
//     const userInfo = this._get(LocalStorageKeys.USER_INFO);
//     return userInfo ? JSON.parse(userInfo) : null;
//   }

//   clear() {
//   }
// }

// // Export singleton instance of service
// export const StorageHelper = new _StorageHelper();
// (window as any).storageHelper = StorageHelper;
