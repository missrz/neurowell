import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null, // stored in memory only
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token || null;
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
