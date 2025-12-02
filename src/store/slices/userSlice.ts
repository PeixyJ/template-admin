import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { UserVO } from '@/types/user.types'
import { getCurrentUser } from '@/services/user'

interface UserState {
  currentUser: UserVO | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
}

/** 获取当前用户信息 */
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser()
      if (response.data.code === 'SUCCESS') {
        return response.data.data
      }
      return rejectWithValue(response.data.message || '获取用户信息失败')
    } catch (error) {
      return rejectWithValue('获取用户信息失败')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.currentUser = null
      state.error = null
    },
    setUser: (state, action) => {
      state.currentUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUser, setUser } = userSlice.actions
export default userSlice.reducer
