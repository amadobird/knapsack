import React from 'react';
import { image, paragraph, title, text } from '@basalt/demo-data';
import ComponentOverviewPage from '../../../templates/component-overview-page';
import ErrorCatcher from '../../../bedrock/components/error-catcher';

export default () => (
  <ErrorCatcher>
    <ComponentOverviewPage
      id="hero"
      size="full"
      data={{
        title: title(),
        body: paragraph(),
        desc: title(),
        image_overlay: 'black',
        alignment_all: 'left',
        image: image(),
        buttons: [
          {
            text: text(),
          },
          {
            text: text(),
          },
        ],
      }}
    />
  </ErrorCatcher>
);
