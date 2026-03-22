import './mindxTable.scss';
import { FaTrashAlt, FaEdit, FaTimes } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Image } from 'react-bootstrap';
import { useState, useEffect, useMemo, useContext } from 'react';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify.jsx';
import { API } from '@mindx/http/API.js'
import { Context } from '@mindx/index.js';
import moment from 'moment';
import { Tooltip } from 'react-tooltip';

const MindxTable = (props) => {
	const { user } = useContext(Context);
	const { template, data, type, setReload, state, setState, settings } = props;
	const [searchTerm, setSearchTerm] = useState('');

	const filteredData = useMemo(() => {
		if (!searchTerm) return data;

		return data.filter(item => {
			return template.some(column => {
				const value = item[column.type];
				if (typeof value === 'string') {
					return value.toLowerCase().includes(searchTerm.toLowerCase());
				}
				return false;
			});
		});
	}, [data, searchTerm, template]);

	const editItem = (item) => {
		setState({
			mode: 'edit',
			item: item,
			type: type,
		})
	};

	const deleteItem = async (item) => {
		try {
      confirmAlert({
        title: 'Подтверждение',
        message: 'Вы уверены, что хотите удалить этот элемент?',
        buttons: [
          {
            label: 'Да',
            onClick: async () => {
              const data = await API[type].deleteById(item.id);
              SuccessEmmiter(data.message);
              setReload(true);
            }
          },
          {
            label: 'Нет',
            onClick: () => {}
          }
        ]
      });
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.message || 'Произошла ошибка при удалении');
      console.error(error);
    }
	};

	const createItem = () => {
		setState({
			mode: 'create',
			item: {},
			type: type,
		})
	};

	const getPointsValue = (item) => {
		if (item) {
			return item?.isCorrect ? item?.points : 0;
		} else {
			return '-';
		}
	};

	const getAnswerStatus = (item) => {
		if (item) {
			return item.isCorrect ? 'correct' : 'incorrect';
		} else {
			return 'none';
		}
	};

	const getTooltipContent = (column, row) => {
    const value = row[column.type];
    const columnMeta = column?.meta;
    if (!['img', 'question-list'].includes(columnMeta)) {
      return String(value);
    }
    return null;
  };

	const getColumnValue = (column, row) => {
    const columnMeta = column?.meta;
    const value = row[column.type];
    
    switch (columnMeta) {
      case 'img':
        return value 
          ? <Image
              width={150}
              height={150}
              src={`${process.env.REACT_APP_HOST}/api/${value}.jpg`}
            />
          : <>{"-"}</>
      case 'datetime':
        return moment(new Date(value)).format('DD.MM.YYYY HH:mm');
      case 'question-list': 
        return Array.isArray(value) ? (
        <div className="compact-questions-container">
          <div className="compact-questions-list">
            {value.map((item, idx) => (
              <div 
                key={`LISTQ-${idx}`} 
                className={`compact-question ${getAnswerStatus(item)}`}
              >
                <span className="compact-number">#{ idx + 1 }</span>
                <span className={`compact-points ${getAnswerStatus(item)}`}>
									{ getPointsValue(item) }
								</span>
              </div>
            ))}
          </div>
        </div>
      ) : <>{"-"}</>;
      default:
        return value;
    }
  }

	return (
    <>
      <div className='table-header'>
        <input 
          type='text' 
          placeholder='Поиск...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {!settings?.off_CUD && (
          <button onClick={createItem}>Создать объект</button>
        )}
      </div>
      
      <table className='objectlist-section'>
        <thead>
          <tr>
            {template?.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredData?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {template?.map((column, colIndex) => {
                const tooltipId = `tooltip-${rowIndex}-${colIndex}`;
                const tooltipContent = getTooltipContent(column, row);
                
                return (
                  <td 
                    key={colIndex}
                    data-tooltip-id={tooltipContent ? tooltipId : undefined}
                    data-tooltip-content={tooltipContent}
                  >
                    {getColumnValue(column, row)}
                  </td>
                );
              })}
              <td className='command-icons'>
                {!settings?.off_CUD &&
                  (type !== 'role' || (row.name !== 'ADMIN' && row.name !== 'USER')) &&
                  (type !== 'user' || (row.id !== user.user.id)) && (
                  <>
                    <button onClick={() => editItem(row)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => deleteItem(row)}>
                      <FaTrashAlt />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData?.map((row, rowIndex) => (
        template?.map((column, colIndex) => {
          const tooltipId = `tooltip-${rowIndex}-${colIndex}`;
          const tooltipContent = getTooltipContent(column, row);
          
          return tooltipContent ? (
            <Tooltip
              key={tooltipId}
              id={tooltipId}
              place="top"
              effect="solid"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                overflow: "hidden",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                zIndex: 9999,
              }}
            />
          ) : null;
        })
      ))}
    </>
  );
};

export default MindxTable;