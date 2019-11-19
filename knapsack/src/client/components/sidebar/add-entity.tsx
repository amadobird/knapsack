import React, { useState } from 'react';
import cn from 'classnames'; // https://www.npmjs.com/package/classnames
import './add-entity.scss';
import { Formik, Form, Field } from 'formik';

type Props = {
  /**
   * Icon to display
   */
  icon: string;
  /**
   * Give it a dark color scheme?
   */
  isDark?: boolean;
  handleAdd: (values: MyFormValues) => void;
};

interface MyFormValues {
  title: string;
  entityType?: 'pattern' | 'page' | 'group';
}

// @TODO add event listener to close popup if clicks elsewhere on the screen

export const AddEntity: React.FC<Props> = ({
  icon,
  handleAdd,
  isDark = false,
}: Props) => {
  const initialValues: MyFormValues = {
    title: '',
  };

  const [isShowing, setIsShowing] = useState(false);

  const classes = cn({
    'ks-add-entity': true,
    'ks-add-entity--is-dark': isDark,
    'ks-add-entity--active': isShowing,
  });

  return (
    <div className={classes}>
      <div className="ks-add-entity-popup">
        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            handleAdd(values);
            actions.setSubmitting(false);
          }}
          /* eslint-disable */
          render={() => (
            <Form>
              <Field as="radio" name="entityType">
                <input type="radio" id="pattern" name="entityType" value="pattern" />
                <label htmlFor="pattern">Pattern</label>
                <br />
                <input type="radio" id="page" name="entityType" value="page" />
                <label htmlFor="page">Page</label>
                <br />
                <input type="radio" id="group" name="entityType" value="group" />
                <label htmlFor="group">Group</label>
                <br />
              </Field>
              <Field
                name="title"
                render={({ field, form, meta }) => (
                  <div>
                    <input type="text" {...field} placeholder="Title" />
                    {meta.touched && meta.error && meta.error}
                  </div>
                )}
              />
              <button type="submit">Submit</button>
            </Form>
          )}
        />
      </div>
      <h2 onClick={() => setIsShowing(!isShowing)}>{icon}</h2>
    </div>
  );
  /* eslint-enable */
};
