import { createSlice } from "@reduxjs/toolkit";

import { clearAuth, getStoredToken, getStoredUser, saveAuth } from "../../utils/auth";

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken())
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      saveAuth(token, user);
    },
    syncStoredAuth: (state) => {
      state.user = getStoredUser();
      state.token = getStoredToken();
      state.isAuthenticated = Boolean(getStoredToken());
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuth();
    }
  }
});

export const { setCredentials, syncStoredAuth, logout } = authSlice.actions;
export default authSlice.reducer;
