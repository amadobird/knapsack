import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Loadable from 'react-loadable';
import Spinner from './bedrock/components/spinner';
import Header from './components/header';
import './global.css';
import ErrorCatcher from './bedrock/components/error-catcher';
import { apiUrlBase } from '../config';

const LoadableComponentOverview = Loadable({
  loader: () => import(/* webpackChunkName: 'component-overview' */ './layouts/component-overview'),
  loading: Spinner,
});

const LoadableAboutPage = Loadable({
  loader: () => import(/* webpackChunkName: 'about-page' */ './pages/about'),
  loading: Spinner,
});

const LoadableReleaseNotes = Loadable({
  loader: () => import(/* webpackChunkName: 'release-notes' */ './pages/about/release-notes'),
  loading: Spinner,
});

const LoadableFeatureRequest = Loadable({
  loader: () => import(/* webpackChunkName: 'feature-requests' */ './pages/about/feature-requests'),
  loading: Spinner,
});

// const LoadableVisualLanguagePage = Loadable({
//   loader: () => import(/* webpackChunkName: 'visual-language-page' */ ' .pages/visual-language/visual-language-board'),
//   loading: Spinner,
// });

const LoadableAnimations = Loadable({
  loader: () => import(/* webpackChunkName: 'animations' */ './pages/visual-language/animations'),
  loading: Spinner,
});

const LoadableBreakpoints = Loadable({
  loader: () => import(/* webpackChunkName: 'breakpoints' */ './pages/visual-language/breakpoints'),
  loading: Spinner,
});

const LoadableColors = Loadable({
  loader: () => import(/* webpackChunkName: 'colors' */ './pages/visual-language/colors'),
  loading: Spinner,
});

const LoadableSpacings = Loadable({
  loader: () => import(/* webpackChunkName: 'spacings' */ './pages/visual-language/spacings'),
  loading: Spinner,
});

const LoadableTypography = Loadable({
  loader: () => import(/* webpackChunkName: 'typography' */ './pages/visual-language/typography'),
  loading: Spinner,
});

// const LoadablePatternsPage = Loadable({
//   loader: () => import(/* webpackChunkName: 'patterns-page' */ './pages/patterns'),
//   loading: Spinner,
// });


const LoadableLogoDownloads = Loadable({
  loader: () => import(/* webpackChunkName: 'logo-downloads' */ './pages/resources/logo-downloads'),
  loading: Spinner,
});

const LoadableLogoUsage = Loadable({
  loader: () => import(/* webpackChunkName: 'logo-usage' */ './pages/resources/logo-usage'),
  loading: Spinner,
});

const LoadablePhotographyGuidelines = Loadable({
  loader: () => import(/* webpackChunkName: 'photography-guidelines' */ './pages/resources/photography-guidelines'),
  loading: Spinner,
});

const LoadableSidebar = Loadable({
  loader: () => import(/* webpackChunkName: 'sidebar' */ './components/sidebar'),
  loading: Spinner,
});

const LoadableFooter = Loadable({
  loader: () => import(/* webpackChunkName: 'footer' */ './components/footer'),
  loading: Spinner,
});

const Site = styled.div`
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 229px);
  width: 100%;
`;

const MainContent = styled.div`
  flex-grow: 1;
`;

const SiteFooter = styled.div`
  background-color: #16394b;
  color: white;
  && a {
    color: white;
  }
`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patterns: [],
      ready: false,
    };
  }

  componentDidMount() {
    window
      .fetch(`${apiUrlBase}/patterns/component`)
      .then(res => res.json())
      .then(patterns => {
        this.setState({ patterns, ready: true });
      });
  }

  render() {
    return (
      <ErrorCatcher>
        <Router>
          <div>
            <Header siteTitle={'Crux'} />
            <Site>
              <LoadableSidebar patterns={this.state.patterns} />
              <MainContent>
                <Switch>
                  <Route
                    path="/about"
                    component={LoadableAboutPage}
                    exact={true}
                  />
                  <Route
                    path="/about/release-notes"
                    component={LoadableReleaseNotes}
                  />
                  <Route
                    path="/about/feature-requests"
                    component={LoadableFeatureRequest}
                  />
                  {/*<Route*/}
                    {/*path="/visual-language"*/}
                    {/*component={LoadableVisualLanguagePage}*/}
                    {/*exact={true}*/}
                  {/*/>*/}
                  <Route
                    path="/visual-language/animations"
                    component={LoadableAnimations}
                  />
                  <Route
                    path="/visual-language/breakpoints"
                    component={LoadableBreakpoints}
                  />
                  <Route
                    path="/visual-language/colors"
                    component={LoadableColors}
                  />
                  <Route
                    path="/visual-language/spacings"
                    component={LoadableSpacings}
                  />
                  <Route
                    path="/visual-language/typography"
                    component={LoadableTypography}
                  />
                  {/*<Route*/}
                    {/*path="/patterns"*/}
                    {/*component={LoadablePatternsPage}*/}
                    {/*exact={true}*/}
                  {/*/>*/}
                  <Route
                    path="/resources/logo-downloads"
                    component={LoadableLogoDownloads}
                  />
                  <Route
                    path="/resources/logo-usage"
                    component={LoadableLogoUsage}
                  />
                  <Route
                    path="/resources/photography-guidelines"
                    component={LoadablePhotographyGuidelines}
                  />
                  <Route
                    path="/patterns/components/:id"
                    render={({ match }) => (
                      <LoadableComponentOverview id={match.params.id} size="l" key={match.params.id} />
                    )}
                  />
                  <Route
                    path="/resources/:id"
                    render={({ match }) => {
                        const Component = [match.id];
                        return (<Component />);
                      }
                    }
                  />
                  <Route
                    render={() => (
                      <div>
                        <h3>Page Not Found ¯\_(ツ)_/¯</h3>
                      </div>
                    )}
                  />
                </Switch>
              </MainContent>
            </Site>
            <SiteFooter>
              <LoadableFooter />
            </SiteFooter>
          </div>
        </Router>
      </ErrorCatcher>
    );
  }
}
