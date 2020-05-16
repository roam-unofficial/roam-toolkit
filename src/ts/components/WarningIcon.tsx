import * as React from 'react'
import styled from 'styled-components'
import Tooltip from './Tooltip'

type WarningIconProps = {
    warning?: string
}
const IconWrap = styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    background-color: rgba(255, 165, 0, 0.1);
    width: 20px;
    border-radius: 4px;

    &:hover {
        background-color: rgba(255, 165, 0, 0.25);
    }
`

const WarningIconSvg = (props: {fill: string}) => {
    return (
        <svg width={'12px'} viewBox="0 0 640 640" {...props}>
            <title />
            <path d="M93.76 546.24C33.487 487.969-3.932 406.389-3.932 316.067c0-176.731 143.269-320 320-320 90.321 0 171.902 37.42 230.086 97.602l.086.09c55.578 57.487 89.828 135.897 89.828 222.307 0 176.731-143.269 320-320 320-86.41 0-164.821-34.249-222.398-89.914l.09.086zM288 160v192h64V160h-64zm0 256v64h64v-64h-64z" />
        </svg>
    )
}
export const WarningIcon = (props: WarningIconProps) => {
    if (!props.warning) {
        return null
    }
    return (
        <Tooltip tooltip={props.warning}>
            <IconWrap>
                <WarningIconSvg fill="orange" />
            </IconWrap>
        </Tooltip>
    )
}
