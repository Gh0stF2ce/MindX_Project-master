import './model.scss';
import { useState, useEffect } from 'react';
import { API } from '@mindx/http/API';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';

const Role = (props) => { 
  const { model } = props;
  const [role, setRole] = useState(model?.name ? model.name : '');

  useEffect(() => {
    model.name = role;
  }, [role])

  return (    
    <div className="model-section">
      <form onSubmit={e => e.preventDefault()}>
      <div className='group-label'>
        <label>Название</label>
        <input type="text" placeholder="Название роли..."
          value={role} onChange={(e) => setRole(e.target.value)}/> 
      </div>     
      </form>
    </div>
  );
}

export default Role;