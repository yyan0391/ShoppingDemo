import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export async function fetchUserRoleFromDatabase(uid) {
  try {
    const userDocRef = doc(db, "users", uid); // 假设 'users' 集合中存储了用户角色信息
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.warn("用户数据不存在");
      return null;
    }
  } catch (error) {
    console.error("获取用户角色失败：", error);
    return null;
  }
}
