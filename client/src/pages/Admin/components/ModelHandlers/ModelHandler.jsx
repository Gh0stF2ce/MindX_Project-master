import './handler.scss'
import Model from './Models';
import { API } from '@mindx/http/API';
import { useState, useEffect } from 'react'
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';
import { mindxDebounce } from '@mindx/utils/tools';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const ModelHandler = (props) => {
  const { state, setState, setReload } = props;
  const Component = Model[state.type];
  const [copyObject, setCopyObject] = useState(null);
  useEffect(() => {
    setCopyObject(JSON.parse(JSON.stringify(state.item)));
  }, [state.item])

  const put = mindxDebounce(() => {
    confirmAlert({
      title: 'Подтверждение',
      message: 'Вы уверены, что хотите сохранить изменения?',
      buttons: [
        {
          label: 'Да',
          onClick: async () => {
            try {
              const data = await API[state.type].update(copyObject);
              SuccessEmmiter(data.message);
              setReload(true);
              cancel();
            } catch(error) {     
              const errorsArray = error?.response?.data?.errors || ['Произошла ошибка при обновлении'];
              errorsArray.forEach((errorMessage) => ErrorEmmiter(errorMessage));
              console.error(error);
            }
          }
        },
        {
          label: 'Нет',
          onClick: () => {}
        }
      ]
    });
  });

  const create = mindxDebounce(async () => {
    try {
      const data = await API[state.type].addItem(copyObject);
      SuccessEmmiter(data.message);
      setReload(true);
      cancel();
    } catch(error) {
      console.error(error);
      ErrorEmmiter(error?.response.data?.error);
    }
  });

  const cancel = () => {
    setState({});
  };

  return ( 
    <>
      <div className='handler-dark' onClick={ () => cancel() }></div>
      <div className="handler-section">
        {state?.mode === 'edit' ? 
          <>
            <div className='btn-container'>
              <button className='btn success' onClick={() => put() }>Сохранить</button>
              <button className='btn cancel' onClick={() => cancel() }>Отменить</button>
            </div>
          </>
          :
          <>
            <div className='btn-container'>
              <button className='btn success' onClick={() => create() }>Сохранить</button>
              <button className='btn cancel' onClick={() => cancel() }>Отменить</button>
            </div>
          </>
        }
        { Component && copyObject 
          ? <Component model={copyObject}/> 
          : <></> 
        }
      </div>
    </>
  );
}

export default ModelHandler;