module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'object',
  title: 'Card',
  description: 'A Card that powers the internet',
  required: ['title', 'body', 'img'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
    },
    body: {
      type: 'string',
      title: 'Body',
    },
    img: {
      type: 'string',
      title: 'Image Path',
    },
    align: {
      title: 'Image Alignment',
      type: 'string',
      enum: ['top', 'right', 'bottom', 'left'],
      default: 'left',
    },
  },
  examples: [
    {
      title: "I'm a Card Title",
      body:
        "I'm a body - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      img: '/images/imagePlaceholder1.png',
    },{
      title: "I'm a Card Title",
      body:
        "I'm a body - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      img: '/images/imagePlaceholder1.png',
    },
  ],
};
