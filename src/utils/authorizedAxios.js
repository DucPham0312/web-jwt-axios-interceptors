import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'


// khởi tạo một đóio tượng Axios (authorizedAxiosInstance) mục đính để custom và cấu hình chung cho dự án
let authorizedAxiosInstance = axios.create()
//Thời gian chờ tối đa của 1 req: 10p
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: Sẽ cho phép axios tự động đính kèm và gửi cookie trong mỗi req lên BE (phục vụ TH nếu chúng ta sử dụng JWT tokens theo cơ chế httpOnly Cookie)
authorizedAxiosInstance.defaults.withCredentials = true

/**
 * Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request & Response)
 * https://axios-http.com/docs/interceptors
 */

// Add a request interceptor: Can thiệp vào giữa cái req API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Do something before request is sent
  //Lấy accessToken từ localStorage và đính kèm vào header
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    //Cần thêm 'Bearer ' vì nên tuân thủ theo chuẩn OAuth 2.0 trong việc xác định loại Token đang sử dụng
    // Bearer là định nghĩa loại token dành cho việc xác thực và ủy quyền
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor: Can thiệp vào giữa cái res nhận về từ API
authorizedAxiosInstance.interceptors.response.use((response) => {
  //Mọi mã http StatusCOde nằm trong khoảng 200-299 sẽ là success và rơi vào đây
  // Do something with response data
  return response
}, (error) => {
  // Mọi mã http StatusCOde nằm ngoài khoảng 200-299 sẽ là success và rơi vào đây
  // Do something with response error
  // console.log(error)

  /**Quan trong: Xử lí Refresh Token tự động */
  // Nếu nhận về mã 401 từ BE, gọi api Logout luôn
  if (error.response?.status === 401) {
    handleLogoutAPI().then(() => {
      //Nếu Th dùng cookie thì xóa userInfo trong LocalStorage
      // localStorage.removeItem('userInfo')  //Dung cookie

      //Điều hướng tới trang Login sau khi Logout thành công, dùng JS thuần
      location.href = '/login'
    })
  }
  //Nếu nhận mã 410 từ BE, gọi tới api Refesh Token để làm mới accessToken
  //Đầu tiên lấy được các req API đang bị lỗi thông qua error.config
  const originalRequest = error.config
  // console.log('originalRequest: ', originalRequest)
  if (error.response?.status === 410 && !originalRequest._retry) {
    //Gán thêm 1 giá trị _retry luôn = true trong khoảng thời gian chờ, để việc refresh token này chỉ luôn gọi 1 lần tại 1 thời gian
    originalRequest._retry = true

    // Lấy refresh từ localStorage (Th LocalS)
    const refreshToken = localStorage.getItem('refreshToken')

    //Gọi api refresh token
    return refreshTokenAPI(refreshToken)
      .then((res) => {
        //Lấy và gán lại accessToken vào LocalS(TH localS)
        const { accessToken } = res.data
        localStorage.setItem('accessToken', accessToken)
        authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

        //Đồng thời là accessToken đã được update lại ở cookie rồi(TH Cookie)

        //Bước cuối quan trọng: return lại axios instance kết hợp với originalRequest để gọi lại nhứng api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequest)
      })
      .catch((_error) => {
        //Nếu nhận bất kì lỗi nào từ api refresh token thì logout luôn
        handleLogoutAPI().then(() => {
          //Nếu Th dùng cookie thì xóa userInfo trong LocalStorage
          // localStorage.removeItem('userInfo')  //Dung cookie

          //Điều hướng tới trang Login sau khi Logout thành công, dùng JS thuần
          location.href = '/login'
        })

        return Promise.reject(_error)
      })
  }

  //xử lí lỗi tập trung phần hiển thị thông báo trả về từ mọi api(clean code)
  //Dùng toastify đê hiển thị lõio lên màn hình trừ lỗi 410- GONE phục vụ việc tự động refresh lại token
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }

  return Promise.reject(error)
})


export default authorizedAxiosInstance