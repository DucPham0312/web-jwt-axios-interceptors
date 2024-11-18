import axios from 'axios'
import { toast } from 'react-toastify'


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

  //xử lí lỗi tập trung phần hiển thị thông báo trả về từ mọi api(clean code)
  //Dùng toastify đê hiển thị lõio lên màn hình trừ lỗi 410- GONE phục vụ việc tự động refresh lại token
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)

  }

  return Promise.reject(error)
})


export default authorizedAxiosInstance