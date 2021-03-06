/* eslint-disable import/no-unresolved */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import ApiDemo from '@knapsack/api-demo';

storiesOf('Api Demo', module).add(
  'Overview',
  withInfo({
    inline: true,
  })(() => (
    <ApiDemo
      title="Test API"
      endpoint="https://jsonplaceholder.typicode.com/todos/1"
      requestType="get"
    />
  )),
);
