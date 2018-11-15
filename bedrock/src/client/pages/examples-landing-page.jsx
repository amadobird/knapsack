import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import uuid from 'uuid/v4';
import { Button, TwoUp, BlockQuoteWrapper } from '@basalt/bedrock-atoms';
import { connectToContext, contextPropTypes } from '@basalt/bedrock-core';
import { apiUrlBase } from '../data';

class ExamplesLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exampleLinks: [],
      redirect: '',
    };
    this.apiEndpoint = `${apiUrlBase}`;
    this.makeNewExample = this.makeNewExample.bind(this);
  }

  componentDidMount() {
    window
      .fetch(`${this.apiEndpoint}/examples`)
      .then(res => res.json())
      .then(examples => {
        const exampleLinks = examples.map(example => ({
          id: example.id,
          title: example.title,
          path: `/examples/${example.id}`,
        }));

        this.setState({
          exampleLinks,
        });
      });
  }

  makeNewExample() {
    const id = uuid();
    window
      .fetch(`${this.apiEndpoint}/example/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: 'My New Example',
          slices: [],
        }),
      })
      .then(res => res.json())
      .then(() => {
        this.setState({
          redirect: id,
        });
      });
  }

  render() {
    const { enableBlockquotes } = this.props.context.settings;
    if (this.state.redirect) {
      return <Redirect to={`/examples/${this.state.redirect}`} />;
    }
    const examples = this.state.exampleLinks.map(exampleLink => (
      <li key={exampleLink.id}>
        <Link to={exampleLink.path}>{exampleLink.title}</Link>
      </li>
    ));
    return (
      <div>
        <h4 className="eyebrow">Prototyping and Samples</h4>
        <h2>Examples</h2>
        {enableBlockquotes && (
          <BlockQuoteWrapper>
            When I design buildings, I think of the overall composition, much as
            the parts of a body would fit together. On top of that, I think
            about how people will approach the building and experience that
            space.
            <footer>Tadao Ando</footer>
          </BlockQuoteWrapper>
        )}
        <TwoUp>
          <div>
            <h3>What is prototyping?</h3>
            <p>
              Website prototypes are mock-ups or demos of what a website will
              look like when it is in production. Our powerful prototyping tool
              allows designers to quickly assemble, arrange, and add content to
              the reusable components of a design system. This allows designers
              and content editors to rapidly test new ideas, create example page
              layouts, and share ideas with the rest of the team.
            </p>
          </div>
          <div>
            <h3>Interactive Examples</h3>
            <ul>{examples}</ul>
          </div>
        </TwoUp>
        <div>
          <h3>Create a New Example</h3>
          <Button
            primary
            onClick={this.makeNewExample}
            onKeyPress={this.makeNewExample}
            type="submit"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }
}

ExamplesLandingPage.propTypes = {
  context: contextPropTypes.isRequired,
};

export default connectToContext(ExamplesLandingPage);