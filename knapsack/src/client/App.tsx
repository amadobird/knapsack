/**
 *  Copyright (C) 2018 Basalt
    This file is part of Knapsack.
    Knapsack is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Knapsack is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Knapsack; if not, see <https://www.gnu.org/licenses>.
 */
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { plugins } from '@knapsack/core';
import Amplify from 'aws-amplify';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import urlJoin from 'url-join';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import awsconfig from '../aws-exports';
import 'react-sortable-tree/style.css';
import {
  updateUser,
  useSelector,
  useDispatch,
  setCurrentTemplateRenderer,
} from './store';
import { KnapsackContextProvider } from './context';
import ErrorCatcher from './utils/error-catcher';
import { BASE_PATHS } from '../lib/constants';
import {
  LoadablePatternView,
  LoadableGraphiqlPage,
  LoadablePatternsPage,
  LoadableSettingsPage,
  LoadableCustomPage,
  LoadableHome,
  LoadableChangelogPage,
  LoadableBadRoute,
  PageWithSidebar,
} from './loadable-components';
import '../cloud/amplify-wrapper.scss';

Amplify.configure(awsconfig);
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

const apolloClient = new ApolloClient({
  // This ensures we don't have `__typename` appear everywhere in stored data ~ https://github.com/apollographql/apollo-client/issues/1913
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

export const App: React.FC = () => {
  const dispatch = useDispatch();

  const settings = useSelector(s => s.settingsState.settings);
  const pages = useSelector(s => s.customPagesState.pages);
  const meta = useSelector(s => s.metaState.meta);
  const { canEdit, isLocalDev, role } = useSelector(s => s.userState);
  const patterns = useSelector(state => {
    // grabbing just what we need in here so the whole App doesn't re-render any time other data inside `patterns` changes
    return state.patternsState.patterns;
  });
  const firstRenderer = useSelector(s => {
    return Object.keys(s.patternsState?.renderers ?? {})[0];
  });
  const currentTemplateRenderer = useSelector(
    s => s.ui.currentTemplateRenderer,
  );

  useEffect(() => {
    // plugins.loadPlugins({
    //   sayHi: () => console.log('hi from plugin api'),
    // });
    dispatch(updateUser());
    dispatch(
      setCurrentTemplateRenderer({
        id: firstRenderer,
      }),
    );
  }, []);

  const knapsackContext = {
    settings,
    features: {}, // @todo remove
    meta,
    permissions: role.permissions,
  };

  return (
    <ErrorCatcher>
      <ApolloProvider client={apolloClient}>
        <KnapsackContextProvider value={knapsackContext}>
          <DndProvider backend={HTML5Backend}>
            <>
              <Router>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={props =>
                      plugins.homePage ? (
                        plugins.homePage.render()
                      ) : (
                        <LoadableHome {...props} />
                      )
                    }
                  />
                  <Route
                    path={BASE_PATHS.PATTERNS}
                    exact
                    component={LoadablePatternsPage}
                  />

                  <Route
                    path={`${BASE_PATHS.GRAPHIQL_PLAYGROUND}`}
                    exact
                    render={props => <LoadableGraphiqlPage {...props} />}
                  />
                  {canEdit && (
                    <Route
                      path={['/settings', '/settings/:kind']}
                      exact
                      render={({ match }) => (
                        <LoadableSettingsPage initialTab={match.params.kind} />
                      )}
                    />
                  )}

                  <Route
                    path={[
                      `${BASE_PATHS.PATTERN}/:patternId`,
                      `${BASE_PATHS.PATTERN}/:patternId/:templateId`,
                      `${BASE_PATHS.PATTERN}/:patternId/:templateId/:demoId`,
                    ]}
                    exact
                    render={({ match }) => {
                      const { patternId, demoId } = match.params;
                      let { templateId } = match.params;
                      const pattern = patterns[patternId];
                      if (!pattern) {
                        return (
                          <LoadableBadRoute
                            title={`Pattern "${patternId}" was not found in the system`}
                            subtitle="Hold your horses"
                            message={`We're having trouble finding the pattern "${patternId}" you requested. Please double check your url and the pattern meta.`}
                          />
                        );
                      }

                      if (templateId) {
                        const templateLanguageId = pattern?.templates?.find(
                          t => t.id === templateId,
                        )?.templateLanguageId;
                        if (templateLanguageId !== currentTemplateRenderer) {
                          dispatch(
                            setCurrentTemplateRenderer({
                              id: templateLanguageId,
                            }),
                          );
                        }
                      }

                      if (!templateId) {
                        templateId = pattern?.templates?.find(
                          t => t.templateLanguageId === currentTemplateRenderer,
                        )?.id;
                      }

                      return (
                        <LoadablePatternView
                          patternId={patternId}
                          templateId={templateId}
                          demoId={demoId}
                          size="m"
                        />
                      );
                    }}
                  />
                  <Route path="/changelog" component={LoadableChangelogPage} />
                  <Route
                    path={`${BASE_PATHS.PAGES}/:pageId`}
                    render={({
                      match: {
                        params: { pageId },
                      },
                    }) => {
                      const page = pages[pageId];
                      if (!page) {
                        return (
                          <LoadableBadRoute
                            title={`Page with id "${pageId}" was not found in the system`}
                            subtitle="Uh oh"
                            message={`Is it one of these? ${Object.keys(
                              pages,
                            ).join(', ')}`}
                          />
                        );
                      }
                      return (
                        <LoadableCustomPage
                          path={`${BASE_PATHS.PAGES}/${pageId}`}
                          key={`${BASE_PATHS.PAGES}/${pageId}`}
                          sectionTitle="Pages"
                          title={page.title}
                          pageId={pageId}
                        />
                      );
                    }}
                  />

                  {plugins.getPlugins().map(plugin => {
                    if (!plugin.addPages) {
                      return null;
                    }
                    return plugin.addPages().map(page => {
                      const path = urlJoin('/', plugin.id, page.path);
                      return (
                        <Route
                          key={path}
                          path={path}
                          render={() => (
                            <PageWithSidebar
                              title={page.title}
                              section={page.section}
                            >
                              {page.render()}
                            </PageWithSidebar>
                          )}
                        />
                      );
                    });
                  })}

                  <Route path="*" render={() => <LoadableBadRoute />} />
                  <Redirect to="/" />
                </Switch>
              </Router>
            </>
          </DndProvider>
        </KnapsackContextProvider>
      </ApolloProvider>
    </ErrorCatcher>
  );
};
