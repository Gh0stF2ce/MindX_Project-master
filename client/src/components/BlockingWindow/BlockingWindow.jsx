import './BlockingWindow.scss';

const BlockingWindow = (props) => {
  const { message } = props;
  return ( 
    <>
      <div className="blocking-window-section">
        <h1>Отказано в доступе.</h1>
        <h1>{message}</h1>
      </div>
    </> 
  );
}
 
export default BlockingWindow;