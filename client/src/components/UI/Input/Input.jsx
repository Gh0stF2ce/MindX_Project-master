const InputComponent = (props) => {
    const { className, inputId, inputValue, placeholder, readOnly, action } = props
    return (
        <input
            className={className}
            id={inputId}
            value={inputValue}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={event => {
                const newValue = event.target.value
                action && action(newValue)
            }}
            type={"text"}
        />
    )
}

export default InputComponent