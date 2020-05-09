import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { ThemeProvider } from 'styled-components';
import { IAppState } from '../../background/store';
import GlobalStyle from '../../components/styles/GlobalStyle';
import { themes, ThemeTypes } from '../../components/styles/themes';
import { Settings } from '../../containers/Settings/Settings';

interface IPopupApp {
  theme: ThemeTypes;
  dispatch: Dispatch;
}

class PopupApp extends React.Component<IPopupApp> {
  render() {
    return (
      <ThemeProvider theme={themes[this.props.theme]}>
        <React.Fragment>
          <GlobalStyle />
          <PopupAppContainer>
            <Settings />
          </PopupAppContainer>
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

export default connect(mapStateToProps)(PopupApp);

const PopupAppContainer = styled('div')`
  height: 500px;
  width: 420px;
  background-color: ${(p) => p.theme.backgroundColor};
`;
