import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { ThemeProvider } from 'styled-components';
import { IAppState } from '../../background/store';
import GlobalStyle from '../../components/styles/GlobalStyle';
import { themes, ThemeTypes } from '../../components/styles/themes';
import { Settings } from '../../containers/Settings/Settings';

interface IOptionsApp {
  theme: ThemeTypes;
  dispatch: Dispatch;
}

class OptionsApp extends React.Component<IOptionsApp> {
  render() {
    return (
      <ThemeProvider theme={themes[this.props.theme]}>
        <React.Fragment>
          <GlobalStyle />
          <OptionsAppContainer>
            <Settings />
          </OptionsAppContainer>
        </React.Fragment>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state: IAppState) => {
  return {
    theme: state.settings.theme,
  };
};

export default connect(mapStateToProps)(OptionsApp);

const OptionsAppContainer = styled('div')`
  background-color: ${(p) => p.theme.backgroundColor};
`;
