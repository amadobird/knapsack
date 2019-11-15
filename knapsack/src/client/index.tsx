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
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { AppState, createStore } from './store';
import { App } from './App';
import { getStateFromLocalStorage } from './store/utils';
import { apiUrlBase } from '../lib/constants';

function getInitialState(): Promise<AppState> {
  return window
    .fetch(`${apiUrlBase}/data-store`)
    .then(res => res.json())
    .then(initialState => {
      console.log({ initialState });
      return initialState;
    })
    .catch(console.log.bind(console));
}

document.addEventListener('DOMContentLoaded', async () => {
  const mountEl = document.createElement('div');
  mountEl.setAttribute('id', 'app');
  document.body.appendChild(mountEl);

  // const cachedState = getStateFromLocalStorage();
  const cachedState = false;
  const initialState =
    cachedState === false ? await getInitialState() : cachedState;

  const store = createStore(initialState);

  ReactDom.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app'),
  );
});
