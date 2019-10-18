export default {
  $schema: 'http://json-schema.org/draft-07/schema',
  title: 'Pattern New Schema',
  type: 'object',
  description: 'Info for creating a new Pattern',
  additionalProperties: false,
  required: ['id', 'title'],
  properties: {
    id: {
      title: 'Id',
      type: 'string',
      description: 'Unique identifier',
    },
    title: {
      title: 'Title',
      type: 'string',
      description: 'Title or Name of the pattern.',
    },
  },
};
