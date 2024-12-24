export default {
    namespaced: true,
    state: {
      user: null, // 保存用户信息
    },
    mutations: {
      setUser(state, user) {
        state.user = user;
      },
      clearUser(state) {
        state.user = null;
      },
    },
    getters: {
      username(state) {
        return state.user?.displayName || "未登录，请点击登录";
      },
    },
  };