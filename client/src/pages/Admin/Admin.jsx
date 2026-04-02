import './admin.scss';
import MindxTable from '@mindx/components/MindxTable/MindxTable';
import MindxTabs from '@mindx/components/MindxTabs/MindxTabs';
import { useContext, useMemo, useState } from 'react';
import ModelHandler from './components/ModelHandlers/ModelHandler.jsx';
import { templates } from '@mindx/metadata/AdminTable'
import { API } from '@mindx/http/API';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';
import { Context } from '@mindx/index';

const AdminPage = () => {
  const { user } = useContext(Context);
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

  const handleLogoutAllUsers = async () => {
    try {
      const response = await API.user.logoutAllUsers();
      SuccessEmmiter(response.message);
      user.logout();
      window.location.reload();
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось завершить все сессии.');
    }
  };

  const tableSettings = useMemo(() => {
    const baseSettings = template?.settings || {};

    if (template?.type === 'user') {
      return {
        ...baseSettings,
        headerActions: [
          {
            label: 'Завершить все сессии',
            className: 'danger-action',
            onClick: handleLogoutAllUsers,
          },
        ],
      };
    }

    return baseSettings;
  }, [template]);

  return (
    <>
      {
        state.mode && state.item && state.type 
          ? <ModelHandler state={state} setState={setState} setReload={setReload}/>
          : <></>
      }
      <main className="admin-wrapper">
        <div className='admin-toolbar'>
          <button className='admin-danger-btn' onClick={handleLogoutAllUsers}>
            Завершить все сессии пользователей
          </button>
        </div>
        <section className="admin-section">
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
              settings={tableSettings}
              />
          </div>
        </section>
      </main>
    </>
  );
}

export default AdminPage;
