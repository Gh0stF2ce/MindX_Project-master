import './model.scss';
import { useState, useEffect } from 'react';
import CatalogRef from '@mindx/components/UI/CatalogRef/CatalogRef';

const Question = (props) => { 
  const { model } = props;
  
  const [question, setQuestion] = useState(model?.question ? model.question : '');
  const [answer, setAnswer] = useState(model?.answer ? model.answer : '');
  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    model.question = (question).trim();
  }, [question])
  useEffect(() => {
    model.answer = (answer).trim();
  }, [answer])
  useEffect(() => {
    model.imageId = imageId;
  }, [imageId])
  
  return (    
    <div className="model-section">
      <form onSubmit={e => e.preventDefault()}>
        <div className='group-label'>
          <label>Текст вопроса</label>
          <textarea placeholder="Текст вопроса..."
            value={question} onChange={(e) => setQuestion(e.target.value)} 
            rows={10}/> 
        </div>     
        <div className='group-label'>
          <label>Текст ответа</label>
          <textarea placeholder="Текст ответа..."
            value={answer} onChange={(e) => setAnswer(e.target.value)} 
            rows={5}/>
        </div>
        <div className='group-label'>
        <label>Изображение</label>
          <CatalogRef 
            defaultValue={ model.imageId ? model.imageId : null } 
            onChange={setImageId}
            url={"image"}
            img={true}
            placeholder="Выберите изображение..."
          />
        </div>
      </form>
    </div>
  );
}

export default Question;