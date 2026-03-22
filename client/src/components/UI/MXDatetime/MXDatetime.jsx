import React from 'react';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';

const MXDatetime = (props) => {
  const { 
    initialValue, 
    onChange,
    dateFormat = "DD.MM.YYYY",
    timeFormat = "HH:mm", 
  } = props;

  const isValidDate = (currentDate) => {
    return currentDate.isSameOrAfter(moment(), 'day');
  };

  const handleChange = (date) => {
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <Datetime
      initialValue={initialValue ? moment(initialValue) : null}
      onChange={handleChange}
      dateFormat={dateFormat}
      timeFormat={timeFormat}
      isValidDate={isValidDate}
      inputProps={{
        placeholder: 'Выберите дату и время',
        readOnly: true,
      }}
    />
  );
};

export default MXDatetime;