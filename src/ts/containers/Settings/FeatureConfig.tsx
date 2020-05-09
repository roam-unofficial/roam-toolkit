import * as React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import styled from 'styled-components'

import {Feature, Setting} from '../../utils/settings'

import {returnToHome} from '../../background/store/settings/actions'

import {Input} from '../../components/Input'
import {Checkbox} from '../../components/Checkbox'
import {Textarea} from '../../components/Textarea'

type FeatureConfigProps = {feature: Feature}

export const FeatureConfig = ({feature}: FeatureConfigProps) => {
    const dispatch = useDispatch()

    function getTextarea(value: string, setting: Setting) {
        return (
            <Textarea
                value={value}
                label={setting.label}
                onSave={v => {
                    dispatch(setting.onSave!(v))
                }}
            />
        )
    }

    function getInput(value: string, setting: Setting) {
        return (
            <Input
                value={value}
                placeholder={setting.placeholder}
                label={setting.label}
                onSave={s => {
                    dispatch(setting.onSave!(s))
                }}
            />
        )
    }

    const settings = feature?.settings?.map((setting, i) => {
        const value = useSelector((state: any) => state[feature.id][setting.id]) || setting.initValue

        if (setting.type === 'large_string') {
            return <Setting key={i}>{getTextarea(value, setting)}</Setting>
        } else if (['string', 'shortcut'].includes(setting.type)) {
            return <Setting key={i}>{getInput(value, setting)}</Setting>
        }
        return null
    })

    const featureName = (
        <FeatureNameContainer>
            <FeatureName>
                <span style={{color: '#a7b6c2'}}>[[</span>
                {feature.name}
                <span style={{color: '#a7b6c2'}}>]]</span>
            </FeatureName>
        </FeatureNameContainer>
    )

    const toggleCheckBox = (
        <Checkbox
            checked={useSelector((state: any) => state[feature.id].active)}
            label={featureName}
            onSave={checked => {
                dispatch(feature.toggle!(checked))
            }}
        />
    )

    const header = feature.toggleable ? toggleCheckBox : featureName

    return (
        <FeatureConfigContainer>
            <Header>
                <Back
                    onClick={() => {
                        dispatch(returnToHome())
                    }}
                >
                    ←
                </Back>
                {header}
            </Header>
            <ConfigsContainer>{settings}</ConfigsContainer>
        </FeatureConfigContainer>
    )
}

const FeatureConfigContainer = styled('div')`
    padding-left: 30px;
`

const Header = styled('div')`
    padding: 20px 0;
    border-bottom: 1px solid #989898;
    margin-bottom: 13px;
`

const Back = styled('button')`
    background: none;
    font-size: 20px;
    font-weight: bold;
    color: #444;
    border: none;
    margin-right: 6px;
    top: 2px;
    position: relative;
    padding-left: 0;

    &:hover {
        cursor: pointer;
    }
`

const FeatureNameContainer = styled('span')``

const FeatureName = styled('span')`
    color: #137cbd;
    font-size: 17px;
`

const ConfigsContainer = styled('div')``

const Setting = styled('div')`
    padding: 10px 0 15px 0;
`
