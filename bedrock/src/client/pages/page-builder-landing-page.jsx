import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import shortid from 'shortid';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, TwoUp, BlockQuoteWrapper } from '@basalt/bedrock-atoms';
import { connectToContext, contextPropTypes } from '@basalt/bedrock-core';
import { apiUrlBase } from '../data';

const examplesQuery = gql`
  {
    examples {
      title
      id
    }
  }
`;

class PageBuilderLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: '',
    };
    this.apiEndpoint = `${apiUrlBase}`;
    this.makeNewExample = this.makeNewExample.bind(this);
  }

  makeNewExample() {
    const id = shortid.generate();
    window
      .fetch(`${this.apiEndpoint}/example/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: 'My New Example',
          path: `/examples/${id}`,
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
    const { enableBlockquotes } = this.props.context.features;
    if (this.state.redirect) {
      return <Redirect to={`/examples/${this.state.redirect}`} />;
    }
    return (
      <Query query={examplesQuery}>
        {({ data }) => {
          const { examples = [] } = data;
          return (
            <>
              <h4 className="eyebrow">Prototyping Pages</h4>
              <h2>Page Builder</h2>
              {enableBlockquotes && (
                <BlockQuoteWrapper>
                  When I design buildings, I think of the overall composition,
                  much as the parts of a body would fit together. On top of
                  that, I think about how people will approach the building and
                  experience that space.
                  <footer>Tadao Ando</footer>
                </BlockQuoteWrapper>
              )}
              <TwoUp>
                <div>
                  <h3>What is prototyping?</h3>
                  <p>
                    Website prototypes are mock-ups or demos of what a website
                    will look like when it is in production. Our powerful
                    prototyping tool allows designers to quickly assemble,
                    arrange, and add content to the reusable components of a
                    design system. This allows designers and content editors to
                    rapidly test new ideas, create example page layouts, and
                    share ideas with the rest of the team.
                  </p>
                </div>
                <div>
                  <h3>Pages</h3>
                  <ul>
                    {examples.map(({ id, title }) => (
                      <li key={id}>
                        <Link to={`/examples/${id}`}>{title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </TwoUp>
              <div>
                <h3>Create a New Page</h3>
                <Button
                  primary
                  onClick={this.makeNewExample}
                  onKeyPress={this.makeNewExample}
                  type="submit"
                >
                  Get Started
                </Button>
              </div>
            </>
          );
        }}
      </Query>
    );
  }
}

PageBuilderLandingPage.propTypes = {
  context: contextPropTypes.isRequired,
};

export default connectToContext(PageBuilderLandingPage);
