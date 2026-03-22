import './admin.scss';
import MindxTable from '@mindx/components/MindxTable/MindxTable';
import MindxTabs from '@mindx/components/MindxTabs/MindxTabs';
import { useState } from 'react';
import ModelHandler from './components/ModelHandlers/ModelHandler.jsx';
import { templates } from '@mindx/metadata/AdminTable'

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [template, setTemplate] = useState({});
  const [reload, setReload] = useState(false);
  const [state, setState] = useState({});

  const changeData = (newTemplate, removeLoading) => {
    newTemplate?.api.getList()
      .then(response => setData(response || []))
      .catch(error => console.error(error))
      .finally(() => {
        removeLoading();
      });
  }
  return (
    <>
      {
        state.mode && state.item && state.type 
          ? <ModelHandler state={state} setState={setState} setReload={setReload}/>
          : <></>
      }
      <main className="admin-section">
        <div className='tabs'>
          <MindxTabs 
            setTemplate={setTemplate} 
            templates={templates} 
            setData={setData} 
            reload={reload} 
            setReload={setReload}
            changeData={changeData}
          />
        </div>
        <div className='objects-list'>
          <MindxTable 
            template={template?.fileds} 
            type={template?.type} 
            data={data} 
            state={state}
            setState={setState}
            reload={reload} setReload={setReload}
            />
        </div>
      </main>
    </>
  );
}

export default AdminPage;