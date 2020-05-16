import React from 'react'
import TooltipTrigger from 'react-popper-tooltip'
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
`
const Tooltip = ({children, tooltip, hideArrow, ...props}: Props) => {
    if (!tooltip) {
        return children
    }
    return (
        <TooltipTrigger
            {...props}
            tooltip={({tooltipRef, getTooltipProps}) => (
                <StyledTooltipContent
                    {...getTooltipProps({
                        ref: tooltipRef,
                        className: 'tooltip-container',
                    })}
                >
                    {tooltip}
                </StyledTooltipContent>
            )}
        >
            {({getTriggerProps, triggerRef}) => (
                <span
                    {...getTriggerProps({
                        ref: triggerRef,
                        className: 'trigger',
                    })}
                >
                    {children}
                </span>
            )}
        </TooltipTrigger>
    )
}

export default Tooltip
