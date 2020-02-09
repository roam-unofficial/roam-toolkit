import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setFeatureId } from '../../background/store/settings/actions';

import { Feature, Setting } from '../../utils/settings'

import { Checkbox } from '../../components/Checkbox'


type HomeProps = { features: Feature[] };
export const Home = ({ features }: HomeProps) => {

    const dispatch = useDispatch();

    const theme = useSelector((state: any) => state.settings.theme)

    return (
        <HomeContainer>
            <Header>
                <img src={`../../../assets/logo-${theme}.png`} />
            </Header>
            <FeaturesList>
                {
                    features.map((feature: Feature) => (
                        <FeatureListElement key={feature.id}>
                            {feature.settings.map((setting: Setting) => {
                                if (setting.type === 'activation') {
                                    return <Checkbox
                                        key={`act_${feature.id}`}
                                        checked={useSelector((state: any) => state[feature.id][setting.id]) || false}
                                        onSave={(toggle: boolean) => {
                                            dispatch(setting.onSave(toggle))
                                        }}
                                    />
                                }
                                return;
                            })}
                            <FeatureNameContainer onClick={() => { dispatch(setFeatureId(feature.id)) }}>
                                <FeatureName>
                                    <span style={{ 'color': '#a7b6c2' }}>[[</span>
                                    {feature.name}
                                    <span style={{ 'color': '#a7b6c2' }}>]]</span>
                                </FeatureName>
                            </FeatureNameContainer>
                        </FeatureListElement>
                    ))
                }
            </FeaturesList>
        </HomeContainer>
    );
}

const HomeContainer = styled('div')`
    padding-left:30px;
`;

const Header = styled('div')`
    padding: 20px 0;
    border-bottom: 1px solid #989898;
`;

const FeaturesList = styled('ul')`
    padding: 0;
    margin: 0;
`;

const FeatureListElement = styled('li')`
    border-bottom: 1px solid #E3E3E3;
    position: relative;
    display: flex;
    align-items: center;

    &::after {
        content: "→";
        position: absolute;
        right: 30px;
        top: calc(50% - 10px);
        color: #828282;
    }
`;

const FeatureNameContainer = styled('span')`
    padding: 25px 50px 25px 5px;
    width: 100%;
    z-index: 1;

    &:hover {
        cursor: pointer;
    }
`;

const FeatureName = styled('span')`
    color: #137CBD;
    padding: 0 0 0 2px;
    font-size: 17px;
`;
