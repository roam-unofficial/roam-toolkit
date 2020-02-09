import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Feature, Setting } from '../../utils/settings'

import { returnToHome } from '../../background/store/settings/actions';

import { Input } from '../../components/Input'
import { Checkbox } from '../../components/Checkbox'
import { Textarea } from '../../components/Textarea'

type FeatureConfigProps = { feature: Feature };

export const FeatureConfig = ({ feature }: FeatureConfigProps) => {
    const dispatch = useDispatch();

    const shortcuts = feature.shortcuts ? feature.shortcuts.map((shortcut, i) => {
        const value = useSelector((state: any) => state[feature.id][shortcut.id]) || shortcut.initValue;
        return <Setting key={i}>
            <Input
                value={value}
                placeholder={shortcut.placeholder}
                label={shortcut.label}
                onSave={(s) => { dispatch(shortcut.onSave!(s)) }} />
        </Setting>
    }) : null;

    const settings = feature.settings ? feature.settings.map((setting, i) => {
        if (setting.type === 'textarea') {
            const value = useSelector((state: any) => state[feature.id][setting.id]) || setting.initValue;
            return <Setting key={i}>
                <Textarea
                    value={value}
                    label={setting.label}
                    onSave={(v) => { dispatch(setting.onSave!(v)) }} />
            </Setting>
        }
        return null;
    }) : null;

    const featureName = (
        <FeatureNameContainer>
            <FeatureName>
                <span style={{ 'color': '#a7b6c2' }}>[[</span>
                {feature.name}
                <span style={{ 'color': '#a7b6c2' }}>]]</span>
            </FeatureName>
        </FeatureNameContainer>
    )

    const header = feature.toggleable ? (
        <Checkbox
            checked={useSelector((state: any) => state[feature.id].active)}
            label={featureName}
            onSave={(checked) => { dispatch(feature.toggle!(checked)) }}
        />
    ) : featureName;



    return (
        <FeatureConfigContainer>
            <Header>
                <Back onClick={() => { dispatch(returnToHome()) }}>←</Back>
                {header}
            </Header>
            <ConfigsContainer>
                {shortcuts}
                {settings}
            </ConfigsContainer>
        </FeatureConfigContainer>
    )

};

const FeatureConfigContainer = styled('div')`
    padding-left:30px;
`;

const Header = styled('div')`
    padding: 20px 0;
    border-bottom: 1px solid #989898;
    margin-bottom: 13px;
`;

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
`;

const FeatureNameContainer = styled('span')`
`;

const FeatureName = styled('span')`
    color: #137CBD;
    font-size: 17px;
`;

const ConfigsContainer = styled('div')`
`;

const Setting = styled('div')`
    padding: 10px 0 15px 0;
`;

