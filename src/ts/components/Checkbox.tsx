import * as React from 'react'

import {StyledCheckbox} from './StyledCheckbox'
import styled from 'styled-components'

type CheckboxProps = {
    checked: boolean
    label?: string | React.ReactElement
    description?: string
    onSave: (newValue: boolean) => void
}

const Label = styled('label')`
    display: flex;
    align-items: center;
`

export const Checkbox = ({checked, label, description, onSave}: CheckboxProps) => {
    const [newValue, setValue] = React.useState(checked)
    const styledCheckbox = (
        <StyledCheckbox
            checked={newValue}
            onChange={(e: any) => {
                setValue(e.target.checked)
                onSave(e.target.checked)
            }}
        />
    )

    if (label) {
        return (
            <>
                <Label>
                    {styledCheckbox}
                    <span style={{marginLeft: 8}}>{label}</span>
                </Label>
                {description ? <p>{description}</p> : null}
            </>
        )
    } else {
        return <label>{styledCheckbox}</label>
    }
}
