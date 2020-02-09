import * as React from 'react';

import { StyledCheckbox } from './StyledCheckbox'

type CheckboxProps = {
    checked: boolean, label?: string | React.ReactElement, description?: string,
    onSave: (newValue: boolean) => void
};

export const Checkbox = ({ checked, label, description, onSave }: CheckboxProps) => {
    const [newValue, setValue] = React.useState(checked);
    if (label) {
        return (
            <>
                <label>
                    <StyledCheckbox
                        checked={newValue}
                        onChange={(e: any) => {
                            setValue(e.target.checked)
                            onSave(e.target.checked)
                        }}
                    />
                    <span style={{ marginLeft: 8 }}>{label}</span>
                </label>
                {description ? <p>{description}</p> : null}
            </>
        )
    } else {
        return (
            <label style={{ marginTop: '4px' }}>
                <StyledCheckbox
                    checked={newValue}
                    onChange={(e: any) => {
                        setValue(e.target.checked)
                        onSave(e.target.checked)
                    }}
                />
            </label>
        )
    }

};