const schema = require('./social-schema');

const uiSchema = {};

const meta = {
  id: 'social',
  title: 'Social',
  type: 'component',
  description: 'Collection of Social Media Icons',
  uses: ['inComponent', 'inGrid'],
  templates: [
    {
      name: '@components/_social.twig',
      selector: '.social',
      schema,
      uiSchema,
    },
  ],
  demoSize: 'm',
};

module.exports = {
  meta,
};