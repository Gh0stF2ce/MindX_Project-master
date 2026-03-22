import './lobby.scss'
import GameCard from './components/GameCard/GameCard';
import { API } from '@mindx/http/API';
import { useState, useEffect } from 'react';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';

const Lobby = (props) => {
  //#region development
  const { type } = props;
  
  const [gameList, setGameList] = useState([]);
  //#endregion

  useEffect(() => {
    API.lobby.getList(type)
      .then(response => setGameList(response))
      .catch((error) => {
        console.error(error);
				ErrorEmmiter(error?.response.data?.error);
      });
  }, [type]);

  return (
    <main className="lobby-section">
      <div className="container">
        <div className="access_text">
          <h1>Список игр</h1>
        </div>
        {/*  TODO: Сделать select и searchstring */}
        <ul className="games">
          {gameList.map((card, index) => {
            return <GameCard key={index} model={card}/>
          })}
        </ul>
      </div>
    </main>
  );
}

export default Lobby;