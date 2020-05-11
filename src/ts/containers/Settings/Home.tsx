import * as React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import styled from 'styled-components'
import {setFeatureId} from '../../background/store/settings/actions'

import {Feature} from '../../utils/settings'

import {Checkbox} from '../../components/Checkbox'

type HomeProps = {features: Feature[]}
export const Home = ({features}: HomeProps) => {
    const dispatch = useDispatch()

    const theme = useSelector((state: any) => state.settings.theme)

    const getCheckbox = (feature: Feature) => (
        <Checkbox
            checked={useSelector((state: any) => state[feature.id].active)}
            onSave={(checked: boolean) => {
                dispatch(feature.toggle!(checked))
            }}
        />
    )

    const getFeatureContainer = (feature: Feature) => (
        <FeatureNameContainer
            onClick={() => {
                dispatch(setFeatureId(feature.id))
            }}
        >
            <FeatureName>
                <span style={{color: '#a7b6c2'}}>[[</span>
                <span className="title">{feature.name}</span>
                <span style={{color: '#a7b6c2'}}>]]</span>
            </FeatureName>
        </FeatureNameContainer>
    )

    return (
        <HomeContainer>
            <Header>
                <img src={`../../../assets/logo-${theme}.png`} />
            </Header>
            <FeaturesList>
                {features.map((feature: Feature) => (
                    <FeatureListElement key={feature.id}>
                        <ListElementInner>
                            {feature.toggleable ? getCheckbox(feature) : null}
                            {getFeatureContainer(feature)}
                        </ListElementInner>
                    </FeatureListElement>
                ))}
            </FeaturesList>
        </HomeContainer>
    )
}

const HomeContainer = styled('div')``

const Header = styled('div')`
    padding: 20px 0 20px 24px;
    border-bottom: 1px solid #989898;
`

const FeaturesList = styled('ul')`
    padding: 0;
    margin: 0;
`

const ListElementInner = styled('div')`
    padding-left: 20px;
    height: 70px;
    width: 100%;
    display: flex;
    align-items: center;

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
`

const FeatureListElement = styled('li')`
    border-bottom: 1px solid #e3e3e3;
    position: relative;
    display: flex;
    align-items: center;

    &::after {
        content: '→';
        position: absolute;
        right: 30px;
        font-size: 20px;
        top: 50%;
        color: #828282;
        transform: translateY(-50%);
    }
    &:hover {
        &::after {
            color: #111111;
        }
    }
`

const FeatureName = styled('div')`
    color: #137cbd;
    font-size: 17px;
`

const FeatureNameContainer = styled('div')`
    display: flex;
    align-items: center;
    align-self: stretch;
    width: 100%;
    padding: 0 50px 0 0;
    width: 100%;
    z-index: 1;
    margin-left: 8px;

    &:hover {
        cursor: pointer;
        ${FeatureName} {
            text-decoration: underline;
        }
    }
`
