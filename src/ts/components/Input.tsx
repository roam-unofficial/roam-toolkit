import * as React from 'react';
import styled from 'styled-components';

type InputProps = {
    value: string;
    label?: string;
    description?: string;
    placeholder?: string;
    onSave: (newValue: string) => void;
};

export const Input = ({
    value,
    label,
    description,
    placeholder,
    onSave,
}: InputProps) => {
    const [newValue, setValue] = React.useState(value);
    const [saved, setSave] = React.useState(false);

    const save = () => {
        onSave(newValue);
        setSave(true);
        setTimeout(() => {
            setSave(false);
        }, 1500);
    };

    return (
        <div>
            <label>
                <Label>{label}:</Label>
                <StyledInput
                    type="text"
                    value={newValue}
                    placeholder={placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={save}
                />
                {saved ? <SavedIndicator>✓</SavedIndicator> : null}
            </label>
            {description ? <p>{description}</p> : null}
        </div>
    );
};

const StyledInput = styled('input')`
    background-color: #fff;
    border: 1px solid #d5d5d5;
    border-radius: 2px;
    transition: 0.3s;
    height: 29px;
    padding: 0px 6px;
    font-size: 14px;
`;

const SavedIndicator = styled('span')`
    background: #00bc94;
    border-radius: 3px;
    color: #fff;
    margin-left: -25px;
    font-size: 14px;
    padding: 3px 4px 1px 4px;
`;

const Label = styled('div')`
    font-size: 13px;
    margin-bottom: 2px;
`;
