import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notify = () => {
  return ( 
    <ToastContainer />
  );
}

const ErrorEmmiter = (error) => toast.error(error, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: null,
    theme: "colored",
  });

const SuccessEmmiter = (message) => toast.success(message, {
  position: "bottom-center",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: null,
  theme: "colored",
  });
 
export { Notify, ErrorEmmiter, SuccessEmmiter };