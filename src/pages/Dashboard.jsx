
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT } from '~/utils/constants'
import { useNavigate } from 'react-router-dom'
import { handleLogoutAPI } from '~/apis'


function Dashboard() {
  const [user, setUser] = useState(null)
  const navidate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // console.log('data from api: ', res.data)
      // console.log('data from localstorage: ', JSON.parse(localStorage.getItem('userInfo')))

      setUser(res.data)
    }
    fetchData()
  }, [])

  /**Xử lí vấn đề API Refresh Token bị gọi nhiều lần */
  useEffect(() => {
    const fetchData = async () => {
      await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    //Gọi api Logout
    await handleLogoutAPI()
    //Nếu Th dùng cookie thì xóa userInfo trong LocalStorage
    // localStorage.removeItem('userInfo')  //Dung cookie

    //Cuối cùng điều hướng đến trang login
    navidate('/login')
  }

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      maxWidth: '1120px',
      marginTop: '1em',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em'
    }}>
      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      <Button
        type='button'
        variant='contained'
        color='info'
        size='large'
        sx={{ mt:2, maxWidth: 'min-content', alignSelf: 'flex-end' }}
        onClick={handleLogout}
      >
        Logout
      </Button>

      <Divider sx={{ my: 2 }} />
    </Box>
  )
}

export default Dashboard
