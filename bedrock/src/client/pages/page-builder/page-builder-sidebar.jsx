/**
 *  Copyright (C) 2018 Basalt
    This file is part of Bedrock.
    Bedrock is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Bedrock is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Bedrock; if not, see <https://www.gnu.org/licenses>.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ClearFilterButton,
  TypeToFilter,
  TypeToFilterInputWrapper,
} from '@basalt/bedrock-atoms';
import { FaTimes } from 'react-icons/fa';
import PageBuilderEditForm from './page-builder-edit-form';
import PlaygroundSidebarPatternListItem from './page-builder-pattern-list-item';
import {
  PatternListWrapper,
  PlaygroundStyledSchemaForm,
  PlaygroundStyledLink,
} from './page-builder.styles';
import { BASE_PATHS } from '../../../lib/constants';

// Export of allowed sidebarContent states
export const SIDEBAR_DEFAULT = 'default';
export const SIDEBAR_FORM = 'form';
export const SIDEBAR_PATTERNS = 'patterns';

function PageBuilderSidebar(props) {
  if (props.sidebarContent === SIDEBAR_FORM) {
    const { slices, editFormSliceId, editFormSchema, editFormUiSchema } = props;
    return (
      <PageBuilderEditForm
        schema={editFormSchema}
        uiSchema={editFormUiSchema}
        data={slices.find(s => s.id === editFormSliceId).data}
        handleChange={data => props.handleEditFormChange(data)}
        handleError={console.error}
        handleHideEditForm={props.handleHideEditForm}
        handleClearData={data => props.handleClearData(data)}
      />
    );
  }
  if (props.sidebarContent === SIDEBAR_PATTERNS) {
    const patterns = props.patterns.filter(pattern =>
      pattern.meta.uses.includes('inSlice'),
    );
    const items =
      props.filterTerm === ''
        ? patterns
        : patterns.filter(
            item =>
              item.meta.title
                .toLowerCase()
                .search(props.filterTerm.toLowerCase()) !== -1,
          );

    return (
      <div>
        <h4>Patterns</h4>
        <TypeToFilter>
          <h6 className="eyebrow">Filter List</h6>
          <TypeToFilterInputWrapper>
            <input
              type="text"
              className="type-to-filter"
              placeholder="Type to filter..."
              value={props.filterTerm}
              onChange={event => props.handleFilterChange(event)}
            />
            <ClearFilterButton
              role="button"
              onClick={props.handleFilterReset}
              onKeyPress={props.handleFilterReset}
              isVisible={!!props.filterTerm}
            >
              <FaTimes />
            </ClearFilterButton>
          </TypeToFilterInputWrapper>
        </TypeToFilter>
        <PatternListWrapper>
          {items.map(pattern => (
            <PlaygroundSidebarPatternListItem
              key={pattern.id}
              pattern={pattern}
              handleAddSlice={props.handleAddSlice}
            />
          ))}
        </PatternListWrapper>

        <Button
          onClick={props.handleCancelAddSlice}
          onKeyPress={props.handleCancelAddSlice}
          type="button"
          className="button button--color-white button--size-small"
        >
          Cancel
        </Button>
      </div>
    );
  }

  // if (props.sidebarContent === SIDEBAR_DEFAULT or anything else)
  return (
    <div>
      <h4>Page Builder</h4>
      <PlaygroundStyledSchemaForm
        onChange={({ formData }) => props.handleMetaFormChange(formData)}
        formData={props.metaFormData}
        schema={{
          title: 'Metadata',
          type: 'object',
          properties: {
            title: {
              title: 'Page Title',
              type: 'string',
            },
            description: {
              title: 'Description',
              type: 'string',
            },
            hasVisibleControls: {
              title: 'Show Edit Controls',
              type: 'boolean',
              default: true,
            },
          },
        }}
        uiSchema={{
          description: {
            'ui:widget': 'textarea',
            'ui:options': {
              rows: 10,
            },
          },
        }}
      />
      <div style={{ display: 'flex' }}>
        <Button
          type="submit"
          onKeyPress={() => props.handleSave()}
          onClick={() => props.handleSave()}
          primary
        >
          Save
        </Button>
        <PlaygroundStyledLink
          to={BASE_PATHS.PAGES}
          style={{ marginLeft: '15px' }}
        >
          Back
        </PlaygroundStyledLink>
      </div>
    </div>
  );
}

PageBuilderSidebar.propTypes = {
  editFormSchema: PropTypes.object.isRequired,
  editFormUiSchema: PropTypes.object.isRequired,
  editFormSliceId: PropTypes.string.isRequired,
  filterTerm: PropTypes.string.isRequired,
  handleAddSlice: PropTypes.func.isRequired,
  handleEditFormChange: PropTypes.func.isRequired,
  handleClearData: PropTypes.func.isRequired,
  handleCancelAddSlice: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  handleFilterReset: PropTypes.func.isRequired,
  handleHideEditForm: PropTypes.func.isRequired,
  handleMetaFormChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  metaFormData: PropTypes.object.isRequired,
  patterns: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarContent: PropTypes.string.isRequired,
  slices: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default PageBuilderSidebar;
