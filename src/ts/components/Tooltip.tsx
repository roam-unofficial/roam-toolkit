import React from 'react'
import TooltipTrigger, {ChildrenArg, TooltipArg} from 'react-popper-tooltip'
import styled from 'styled-components'

type Props = {
    children: any
    tooltip?: string
}
const StyledTooltipContent = styled('div')`
    max-width: 140px;
    background-color: #111;
    color: white;
    padding: 10px;
    z-index: 10;
`
function renderTooltipContent(tooltip: string) {
    return ({tooltipRef, getTooltipProps}: TooltipArg) => (
        <StyledTooltipContent
            {...getTooltipProps({
                ref: tooltipRef,
                className: 'tooltip-container',
            })}
        >
            {tooltip}
        </StyledTooltipContent>
    )
}
function renderTooltipTrigger(children: any) {
    return ({getTriggerProps, triggerRef}: ChildrenArg) => (
        <span
            {...getTriggerProps({
                ref: triggerRef,
                className: 'trigger',
            })}
        >
            {children}
        </span>
    )
}

const Tooltip = ({children, tooltip, ...props}: Props) => {
    if (!tooltip) {
        return children
    }
    return (
        <TooltipTrigger {...props} tooltip={renderTooltipContent(tooltip)}>
            {renderTooltipTrigger(children)}
        </TooltipTrigger>
    )
}

export default Tooltip
