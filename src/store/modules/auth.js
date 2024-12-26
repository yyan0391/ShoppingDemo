
export default {
    namespaced: true,
    state: {
      user: null, // 保存用户信息
      role: "user", // 保存用户角色
    },
    mutations: {
      setUser(state, user) {
        state.user = user;
        state.role = user.role || "user";
      },
      clearUser(state) {
        state.user = null;
        state.role = "user";
      },
    },
    getters: {
      username(state) {
        return state.user?.displayName || "未登录，请点击登录";
      },
      uid(state) {
        return state.user?.uid || null;
      },
      isLogin(state) {
        return !!state.user; // 返回是否已登录
      },
      isAdmin(state) {
        return state.role === "admin";
      },

    },
  };