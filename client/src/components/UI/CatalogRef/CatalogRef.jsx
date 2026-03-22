import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { API } from '@mindx/http/API';
import { ErrorEmmiter } from '@mindx/components/UI/Toastify/Notify';
import { Image } from 'react-bootstrap';
import { useRef } from 'react';

const CatalogRef = (props) => {
  const {
    returnValue = 'data', 
    defaultValue, 
    onChange, 
    url, 
    path, 
    img, 
    isMulti = false,
    placeholder } = props;
  const [objectList, setObjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef(null);


  const fetchData = () => {
    setIsLoading(true);
    API[url].getList()
      .then(response => {
        const options = response.map(item => ({
          value: item.id,
          label: img 
            ? <Image 
              width={200} height={200} src={`${process.env.REACT_APP_HOST}/api/${item.id}.jpg`}
            />
            : item[path],
          data: item
        }));
        setObjectList(options);
      })
      .catch(error => {
        console.error(error);
        ErrorEmmiter(error.message);
      });
    setIsLoading(false);
  };

  useEffect(() => {
    if (defaultValue) {
      if (isMulti) {
        selectRef.current.setValue(
          defaultValue.map(item => (
            {
              value: item.id,
              label: img 
              ? <Image width={200} height={200} src={`${process.env.REACT_APP_HOST}/api/${item.id}.jpg`}
              />
              : item[path],
              data: item
            }
          ))
        )
      } else {
        selectRef.current.setValue({
          value: img ? defaultValue : defaultValue.id,
          label: img
          ? <Image width={200} height={200} src={`${process.env.REACT_APP_HOST}/api/${defaultValue}.jpg`} />
          : defaultValue[path],
          data: defaultValue
        })
      }
    }
  }, []);

  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(
        isMulti 
          ? selectedOption.map(item => img ? item?.value : item[returnValue]) 
          : img ? selectedOption?.value : selectedOption[returnValue]
      );
    }
  };

  return (
    <Select
      ref={selectRef}
      options={objectList}
      onChange={handleChange}
      formatOptionLabel={option => option.label}
      onMenuOpen={fetchData}
      isClearable={true}
      isMulti={isMulti}
      isLoading={isLoading}
      placeholder={placeholder}
    />
  );
};

export default CatalogRef;