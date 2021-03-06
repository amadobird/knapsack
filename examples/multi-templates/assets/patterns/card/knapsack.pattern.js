const schema = require('./card.schema');

const demoDatas = [
  {
    title: "I'm a Card Title 2",
    body:
      "I'm a body - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: '/images/imagePlaceholder1.png',
  },{
    title: "I'm a Card Title 3",
    body:
      "I'm a body - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: '/images/imagePlaceholder1.png',
  },
];

module.exports = {
  id: 'card',
  templates: [

    {
      path: './card.jsx',
      id: 'react',
      title: 'React',
      docPath: './readme-react.md',
      demoDatas,
      schema,
    },
    {
      alias: '@components/card.twig',
      path: './card.twig',
      id: 'twig',
      title: 'Twig',
      demoDatas,
      schema,
    },
    {
      path: './card.html',
      id: 'html',
      title: 'HTML',
      docPath: './readme-html.md',
      schema: {
        ...schema,
        required: [],
        properties: {},
      },
    },
  ],
};
