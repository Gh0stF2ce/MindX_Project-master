import './model.scss';
import { useState, useEffect } from 'react';
import { API } from '@mindx/http/API';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';

const Theme = (props) => { 
  const { model } = props;
  const [theme, setTheme] = useState(model?.name ? model.name : '');

  useEffect(() => {
    model.name = (theme).trim();
  }, [theme])

  return (    
    <div className="model-section">
      <form onSubmit={e => e.preventDefault()}>
      <div className='group-label'>
        <label>Название</label>
        <input type="text" placeholder="Название темы..."
          value={theme} onChange={(e) => setTheme(e.target.value)}/>  
      </div>    
      </form>
    </div>
  );
}

export default Theme;