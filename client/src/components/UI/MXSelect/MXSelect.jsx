import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';

const MXSelect = (props) => {
  const {
    options,
    defaultValue,
    onChange,
    isSearchable = true,
    isDisabled = false,
    isMulti = false,
    placeholder
  } = props;

  const [optionsComponent, setOptionsComponent] = useState([]);
  const ref_select = useRef(null);

  useEffect(() => {
    setOptionsComponent(
      options.map((option) => (
        { 
          value: option.value, 
          label: option.label, 
          data: option 
        }
      ))
    );
  }, []);

  useEffect(() => {
    if (defaultValue) {
      const object = options.find(option => option.value === defaultValue);
      ref_select.current.setValue({
        value: object.value, 
        label: object.label, 
        data: object 
      });
    }
  }, []);

  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption?.value);
    }
  };

  return (
    <>
      <Select
        ref={ref_select}
        options={optionsComponent}
        onChange={handleChange}
        isClearable={true}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        isMulti={isMulti}
        placeholder={placeholder}
      />
    </>
  );
};

export default MXSelect;