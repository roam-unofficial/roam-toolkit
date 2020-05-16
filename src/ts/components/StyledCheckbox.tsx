import React from 'react'
import styled from 'styled-components'

export const StyledCheckbox = ({className = '', checked = false, ...props}) => (
    <CheckboxContainer className={className}>
        <HiddenCheckbox checked={checked} {...props} />
        <StyledCheckboxInside checked={checked}>
            <Icon viewBox="0 0 20 24">
                <polyline points="17 4 9 16 4 10" />
            </Icon>
        </StyledCheckboxInside>
    </CheckboxContainer>
)

const CheckboxContainer = styled.div`
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    padding: 8px;
    height: 14px;
    width: 14px;
    border-radius: 50%;

    &:hover {
        background: rgba(0, 0, 0, 0.1);
    }
`

const Icon = styled.svg`
    fill: none;
    stroke: white;
    stroke-width: 2px;
`
const HiddenCheckbox = styled.input.attrs({type: 'checkbox'})`
    border: 0;
    clip: rect(0 0 0 0);
    clippath: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`

const StyledCheckboxInside: any = styled.div`
    display: inline-block;
    width: 13px;
    height: 13px;
    background: ${(props: any) => (props.checked ? '#137cbd' : '#fff')};
    border: ${(props: any) => (props.checked ? '1px solid #137cbd' : '1px solid #a7b6c2')};
    border-radius: 3px;
    transition: all 150ms;

    ${HiddenCheckbox}:focus + & {
        box-shadow: 0 0 0 5px #c0cbff;
    }

    ${Icon} {
        visibility: ${(props: any) => (props.checked ? 'visible' : 'hidden')};
    }
`
