import './rating.scss';
import { templates } from '@mindx/metadata/RatingTable'
import { useState } from 'react';
import MindxTable from '@mindx/components/MindxTable/MindxTable';
import MindxTabs from '@mindx/components/MindxTabs/MindxTabs';
import { API } from '@mindx/http/API.js'

const Rating = () => {
  const [data, setData] = useState([]);
  const [template, setTemplate] = useState({});
  const [reload, setReload] = useState(false);
  const [state, setState] = useState({});
  const settings = {
    off_CUD: true,
    customTab: true,
    type: 'rating',
    getTabList: async () => await getTabList(),
    showType: true
  }

  const getTabList = async () => {
    try {
      const response = await API?.rating?.getList();
      const typeLabels = {
        carousel: 'Карусель',
        square: 'Квадрат',
        invaders: 'Захватчики',
      };

      return Object.values(response ?? {}).map((game) => ({
        id: game?.id,
        label: game?.name,
        type: typeLabels[game?.typeGame] || game?.typeGame,
      }));
    } catch (error) {
      throw error;
    }
  };

  const changeData = (newTemplate, removeLoading, id) => {
    newTemplate?.api.getById(id)
      .then(response => {
        const rating = response?.rating || [];
        const countQuestions = response?.countQuestion;
        if (countQuestions) {
          for (const user of rating) {
            let userAnswers = Array(countQuestions).fill(null);
            user?.userAnswers?.forEach(answer => {
              userAnswers[answer.numberQuestion - 1] = answer;
            });
            user.userAnswers = userAnswers;
          }
        }
        setData(rating);
      })
      .catch(error => console.error(error))
      .finally(() => {
        removeLoading();
      });
  }
  return ( 
    <main className="rating-section">
      <>
        <main className="admin-section">
          <div className='tabs'>
            <MindxTabs 
              setTemplate={setTemplate} 
              templates={templates} 
              setData={setData} 
              reload={reload} 
              setReload={setReload}
              changeData={changeData}
              settings={settings}
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
              settings={settings}
            />
          </div>
        </main>
      </>
    </main>
  );
}

export default Rating;
