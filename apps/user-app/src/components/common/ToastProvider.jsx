import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}  // Hiển thị toast mới ở trên
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}  // Không dừng khi mất focus
      draggable={true}
      pauseOnHover={true}
      limit={3}  // Giới hạn tối đa 3 toast cùng lúc
      enableMultiContainer={false}  // Tránh nhiều container
      containerId="default"  // ID duy nhất
    />
  )
}

export default ToastProvider 