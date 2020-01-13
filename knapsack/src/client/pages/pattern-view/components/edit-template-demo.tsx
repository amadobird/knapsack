import React, { useState } from 'react';
import {
  KsButton,
  SchemaForm,
  KsPopover,
  KsSvg,
} from '@knapsack/design-system';
import cn from 'classnames';
import { JsonSchemaObject } from '@knapsack/core/types';
import { useSelector } from '../../../store';
import { files, Files } from '../../../data';
import './edit-template-demo.scss';
import { KsFileButtons } from './file-buttons';

type Data = {
  title?: string;
  description?: string;
  path: string;
  alias: string;
};

type Props = {
  maxWidth?: number;
  handleSubmit: (data: Data) => void;
  handleDelete?: () => void;
  data?: Data;
  btnSize?: 's' | 'm';
};

export const EditTemplateDemo: React.FC<Props> = ({
  handleSubmit,
  maxWidth,
  data: initialData,
  btnSize = 'm',
  handleDelete,
}: Props) => {
  const [data, setData] = useState<Data>(initialData);
  const [errors, setErrors] = useState<{ msg: string }[]>([]);
  const currentTemplateRendererId = useSelector(
    s => s.ui.currentTemplateRenderer,
  );
  const currentTemplateRenderer = useSelector(
    s => s.patternsState.renderers[currentTemplateRendererId],
  );

  if (!currentTemplateRenderer) return null;

  /** Are we creating a template or editing one? */
  const isNewTemplate = !initialData?.path;

  const {
    title,
    aliasUse,
    aliasDescription,
    aliasTitle = 'Alias',
    iconSvg,
  } = currentTemplateRenderer?.meta;

  const classes = cn({
    'ks-edit-template-demo': true,
  });

  const schema: JsonSchemaObject = {
    type: 'object',
    required: ['path'],
    properties: {
      path: {
        type: 'string',
        title: 'Path',
        description:
          'The file path to the template can be a full absolute path, a relative path from the data directory, or a string that `require.resolve()` can handle.',
      },
    },
  };

  if (aliasUse !== 'off') {
    schema.properties.alias = {
      type: 'string',
      title: aliasTitle,
      description: aliasDescription,
    };
    if (aliasUse === 'required') {
      schema.required.push('alias');
    }
  }

  if (typeof data?.title === 'string') {
    schema.required.push('title');
    schema.properties.title = {
      type: 'string',
      title: 'Title',
      description: 'A new demo',
    };
  }

  if (typeof data?.description === 'string') {
    schema.properties.description = {
      type: 'string',
      title: 'Description',
      description: '',
    };
  }

  return (
    <div
      className={classes}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : '100%' }}
    >
      <div className="ks-edit-template-demo__content">
        <h5 className="ks-edit-template-demo__title">
          {title} Template
          <KsSvg svg={iconSvg} className="ks-edit-template-demo__logo" />
          {!isNewTemplate && handleDelete && (
            <KsPopover
              trigger="click"
              content={
                <p>
                  Are you sure?{' '}
                  <KsButton
                    kind="primary"
                    emphasis="danger"
                    size="s"
                    handleTrigger={handleDelete}
                  >
                    Yes
                  </KsButton>
                </p>
              }
            >
              <KsButton
                icon="delete"
                kind="icon"
                size="s"
                flush
                className="ks-edit-template-demo__delete"
              />
            </KsPopover>
          )}
        </h5>
        <p className="ks-edit-template-demo__intro ks-u-body-small">
          A template demo references is a reference to a pre-coded file, rather
          than being built via the schema data editor.
        </p>

        {data?.path && <KsFileButtons filePath={data?.path} />}

        {errors.length > 0 && (
          <div className="ks-rjsf">
            <div className="panel panel-danger">
              <h3 className="panel-title">Errors</h3>
              <ul>
                {errors.map(error => (
                  <li key={error.msg} className="text-danger">
                    {error.msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="ks-edit-template-demo__form">
          <SchemaForm
            formData={data}
            schema={schema}
            onChange={event => {
              setData(event.formData);
            }}
            liveValidate={false}
            validate={(formData, formErrors) => {
              // if (data.path === 'f') {
              //   formErrors.path.addError('cannot start with f');
              //   formErrors.path.addError('cannot start with f!!');
              // }
              return formErrors;
            }}
            showErrorList
            onSubmit={({ formData }: { formData: Data }) => {
              const { path, alias } = formData;
              setErrors([]);

              files({
                type: Files.ACTIONS.verify,
                payload: {
                  path,
                },
              }).then(result => {
                if (result.type === Files.ACTIONS.verify) {
                  const { relativePath, exists } = result.payload;
                  if (exists) {
                    const newData = {
                      ...formData,
                      path: relativePath,
                    };
                    handleSubmit(newData);
                    setData(newData);
                  } else {
                    setErrors([
                      {
                        msg: `Path: does not exist. Please create the file first.`,
                      },
                    ]);
                    console.error('does not exist!');
                  }
                }
              });
            }}
          >
            <KsButton size={btnSize} type="submit" kind="primary">
              {isNewTemplate ? 'Add' : 'Update'}
            </KsButton>
          </SchemaForm>
        </div>
      </div>
    </div>
  );
};
