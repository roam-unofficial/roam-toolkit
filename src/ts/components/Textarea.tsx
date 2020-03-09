import * as React from 'react';
import styled from 'styled-components';

type TextareaProps = { value: string, label?: string, description?: string, onSave: (newValue: string) => void };

export const Textarea = ({ value, label, description, onSave }: TextareaProps) => {
    const [newValue, setValue] = React.useState(value);
    const [saved, setSave] = React.useState(false);

    return (
        <div>
            {label ? <Label>{label}:</Label> : null}
            <StyledTextarea
                value={newValue}
                onChange={e => setValue(e.target.value)}
            />
            {description ? <p>{description}</p> : null}
            <SaveBtn
                onClick={() => {
                    onSave(newValue);
                    setSave(true);
                    setTimeout(() => {
                        setSave(false);
                    }, 1500);
                }}
            >{saved ? 'Saved ✓' : 'Save'}</SaveBtn>
        </div>
    )

};

const StyledTextarea = styled('textarea')`
    background-color: #fff;
    border: 1px solid #d5d5d5;
    border-radius: 2px;
    min-height: 150px;
    width: calc(100% - 45px);
    padding: 0px 6px;
    font-size: 12px;
`;

const Label = styled('div')`
    font-size: 13px;
    margin-bottom: 2px;
`;

const SaveBtn = styled('button')`
    padding: 6px 20px;
    margin-top: 8px;
    border: none;
    border-radius: 3px;
    font-size: 14px;
    background: #00BC94;
    color: #fff;
    transition: .3s;

    &:hover {
        cursor: pointer;
        background: #009374;
    }
`