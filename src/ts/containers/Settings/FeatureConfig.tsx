import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Feature, Setting, Activation } from '../../utils/settings'

import { returnToHome } from '../../background/store/settings/actions';

import { Input } from '../../components/Input'
import { Checkbox } from '../../components/Checkbox'
import { Textarea } from '../../components/Textarea'

type FeatureConfigProps = { feature: Feature };

export const FeatureConfig = ({ feature }: FeatureConfigProps) => {
    const dispatch = useDispatch();

    const active = useSelector((state: any) => state[feature.id][`${feature.id}_active`]);

    const settings: Setting[] = feature.settings;
    const activationSetting = settings.find(s => s.type === 'activation') as Activation;

    const label = (
        <FeatureNameContainer>
            <FeatureName>
                <span style={{ 'color': '#a7b6c2' }}>[[</span>
                {feature.name}
                <span style={{ 'color': '#a7b6c2' }}>]]</span>
            </FeatureName>
        </FeatureNameContainer>
    )

    return (
        <FeatureConfigContainer>
            <Header>
                <Back onClick={() => { dispatch(returnToHome()) }}>←</Back>
                <Checkbox
                    checked={active}
                    label={label}
                    onSave={(toggle) => { dispatch(activationSetting.onSave(toggle)) }}
                />
            </Header>
            <ConfigsContainer>
                {
                    feature.settings.map((setting, i) => {
                        if (setting.type === 'shortcut') {
                            const value = useSelector((state: any) => state[feature.id][setting.id])
                                || setting.initValue;
                            return <Setting key={i}>
                                <Input
                                    value={value}
                                    placeholder={setting.placeholder}
                                    label={setting.label}
                                    onSave={(shortcut) => { dispatch(setting.onSave!(shortcut)) }} />
                            </Setting>
                        }
                        if (setting.type === 'textarea') {
                            const value = useSelector((state: any) => state[feature.id][setting.id])
                                || setting.initValue;
                            return <Setting key={i}>
                                <Textarea
                                    value={value}
                                    label={setting.label}
                                    onSave={(v) => { dispatch(setting.onSave!(v)) }} />
                            </Setting>
                        }
                        return null;
                    })
                }
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

