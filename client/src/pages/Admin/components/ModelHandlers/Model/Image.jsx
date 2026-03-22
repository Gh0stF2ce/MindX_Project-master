import './model.scss';
import { useState, useEffect } from 'react';

const Image = (props) => { 
  const { model } = props;
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Состояние для предпросмотра
  const formData = new FormData();

  useEffect(() => {
    formData.append('image', imageFile);
    model.formData = formData;
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [imageFile]);

  return (    
    <div className="model-section">
      <form onSubmit={e => e.preventDefault()}>
        <div className='group-label'>
          <label>Файл изображения</label>
          <input 
            type="file" 
            placeholder="Загрузить изображение"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Предпросмотр" />
          </div>
        )}
      </form>
    </div>
  );
}

export default Image;