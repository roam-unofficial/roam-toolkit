import * as React from 'react'
import {useSelector} from 'react-redux'
import styled from 'styled-components'
import {IAppState} from '../../background/store'

import {Home} from './Home'
import {FeatureConfig} from './FeatureConfig'

import {Features} from '../../contentScripts/features'

export const Settings = () => {
    const featureId = useSelector<IAppState, string>(state => state.settings.featureId)
    const feature = featureId === '' ? null : Features.all.find((f: any) => f.id === featureId)
    return (
        <SettingsContainer>
            {!feature ? <Home features={Features.all} /> : <FeatureConfig feature={feature} />}
        </SettingsContainer>
    )
}

const SettingsContainer = styled('div')`
    min-width: 100px;
    background-color: ${p => p.theme.backgroundColor};
`
