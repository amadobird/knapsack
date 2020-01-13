/* eslint-disable no-else-return */
import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  isArrayOfObjectsProp,
  isFunctionProp,
  isOptionsProp,
  isBooleanProp,
  isNumberProp,
  isStringProp,
  PropertyTypes,
  PropTypeNames,
  PropTypeNamesList,
  StringProp,
  JsonSchemaObject,
  PropTypeData,
  isArrayOfStringsProp,
  PropTypeDataBase,
  StringPropTypeData,
} from '@knapsack/core/types';
import { KsButton, KsButtonGroup } from '@knapsack/design-system';
import produce from 'immer';
import shortid from 'shortid';
import { useHistory } from 'react-router-dom';
import arrayMove from 'array-move';
import { validateSpec } from '../../../../../lib/utils';
import {
  useDispatch,
  updateSpec,
  useSelector,
  updateTemplateInfo,
  deleteTemplate,
  setCurrentTemplateRenderer,
} from '../../../../store';
import { KsTemplateSpec, KsSlotInfo } from '../../../../../schemas/patterns';
import { SpecItemTypes, SlotData } from './shared';
import { KsPropEditor } from './prop-editor';
import { KsSlotEditor } from './slot-editor';
import { KsSpecItem } from './spec-item';
import { EditTemplateDemo } from '../edit-template-demo';
import './pattern-settings.scss';
import { BASE_PATHS } from '../../../../../lib/constants';

const removeSpaces = (string: string): string => string.replace(/ /g, '');

type SpecItemsProps = {
  type: keyof typeof SpecItemTypes;
  children: React.ReactNode;
  handleAdd: () => void;
};

const KsSpecItems: React.FC<SpecItemsProps> = ({
  type,
  children,
  handleAdd,
}: SpecItemsProps) => {
  return (
    <div className="ks-spec-items ks-u-margin-top--m">
      <h5 className="ks-spec-items__title">{type}s</h5>
      <div className="ks-spec-items__wrapper ks-u-margin-top--s">
        {children}
      </div>
      <KsButton handleTrigger={handleAdd} kind="standard" icon="add" size="s">
        {type}
      </KsButton>
    </div>
  );
};

type Props = {
  activeTemplateId?: string;
  pattern: KnapsackPattern;
};

export const KsPatternSettings: React.FC<Props> = ({
  pattern,
  activeTemplateId,
}: Props) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { templates } = pattern;
  const hasTemplate = templates?.length > 0;
  const template =
    hasTemplate && activeTemplateId
      ? templates?.find(t => t.id === activeTemplateId)
      : templates[0];
  const rendererMeta = useSelector(
    s =>
      Object.values(s.patternsState.renderers).find(
        ({ meta }) => meta.id === template.templateLanguageId,
      )?.meta,
  );

  const spec = template?.spec ?? {};

  function determinePropType(prop: string): PropTypeDataBase {
    const data: PropertyTypes = spec.props.properties[prop];
    const isRequired = Array.isArray(spec.props.required)
      ? spec.props.required.includes(prop)
      : false;
    let type = PropTypeNames.unknown;

    if (isStringProp(data)) {
      type = PropTypeNames.string;
    } else if (isBooleanProp(data)) {
      type = PropTypeNames.boolean;
    } else if (isFunctionProp(data)) {
      type = PropTypeNames.function;
    } else if (isNumberProp(data)) {
      type = PropTypeNames.number;
    } else if (isOptionsProp(data)) {
      type = PropTypeNames.options;
    } else if (isArrayOfStringsProp(data)) {
      type = PropTypeNames.arrayOfStrings;
    } else if (isArrayOfObjectsProp(data)) {
      type = PropTypeNames.arrayOfObjects;
    }

    return {
      type,
      data,
      isRequired,
      id: prop,
    };
  }

  function convertSlotData(slotDatas: SlotData[]): KsTemplateSpec['slots'] {
    const slots: KsTemplateSpec['slots'] = {};
    slotDatas.forEach(({ id, data }) => {
      slots[id] = data;
    });
    return slots;
  }

  function convertPropData(propDatas: PropTypeData[]): KsTemplateSpec['props'] {
    const props: KsTemplateSpec['props'] = {
      $schema: 'http://json-schema.org/draft-07/schema',
      description: pattern.description,
      type: 'object',
      ...spec.props,
      required: [],
      properties: {},
    };
    propDatas.forEach(({ id, isRequired, data }) => {
      if (isRequired) props.required.push(id);
      props.properties[id] = data;
    });
    return props;
  }

  const propList: PropTypeData[] = Object.keys(
    spec?.props?.properties || {},
  ).map(determinePropType);
  const propListString = useMemo(() => JSON.stringify(propList), [spec?.props]);

  const slotList: SlotData[] = Object.keys(spec?.slots || {}).map(id => {
    return {
      id,
      data: spec.slots[id],
    };
  });
  const slotListString = useMemo(() => JSON.stringify(slotList), [spec?.slots]);

  const [props, setProps] = useState(propList);
  const [slots, setSlots] = useState(slotList);
  const [errors, setErrors] = useState<string[]>([]);

  const moveProp = useCallback(
    (from: number, to: number) => {
      setProps(curProps => arrayMove(curProps, from, to));
    },
    [props],
  );
  const deleteProp = useCallback(
    (index: number) => {
      setProps(curProps => curProps.filter((prop, i) => i !== index));
    },
    [props],
  );

  const moveSlot = useCallback(
    (from: number, to: number) => {
      setSlots(curSlots => arrayMove(curSlots, from, to));
    },
    [slots],
  );

  const deleteSlot = useCallback(
    (index: number) => {
      setSlots(curSlots => curSlots.filter((slot, i) => i !== index));
    },
    [slots],
  );

  const hasChanges =
    propListString !== JSON.stringify(props) ||
    slotListString !== JSON.stringify(slots);

  return (
    <div className="ks-pattern-settings">
      <h3 className="ks-pattern-settings__title">Pattern Settings</h3>
      {errors.length > 0 && (
        <div
          className="ks-pattern-settings__errors ks-u-shade-bg"
          style={{
            borderRadius: 'var(--radius-l)',
            padding: 'var(--space-s)',
            color: 'var(--c-danger)',
          }}
        >
          <p>
            <strong>Errors</strong>
          </p>
          <ul>
            {errors.map(error => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="ks-pattern-settings__edit-template ks-u-margin-top--s">
        <EditTemplateDemo
          btnSize="s"
          data={{
            path: template.path,
            alias: template.alias,
          }}
          handleSubmit={({ path, alias }) => {
            dispatch(
              updateTemplateInfo({
                patternId: pattern.id,
                templateId: template.id,
                template: {
                  path,
                  alias,
                },
              }),
            );
          }}
          handleDelete={() => {
            dispatch(
              deleteTemplate({
                patternId: pattern.id,
                templateId: template.id,
              }),
            );
            setTimeout(() => {
              // go to this pattern page again
              history.push(`${BASE_PATHS.PATTERN}/${pattern.id}`);
              setTimeout(() => {
                // set renderer to this one so we can recreate it again if we'd like
                dispatch(
                  setCurrentTemplateRenderer({
                    id: template.templateLanguageId,
                  }),
                );
              }, 50);
            }, 50);
          }}
        />
      </div>
      <h4 className="ks-pattern-settings__sub-title">Templates</h4>
      <KsButtonGroup isGapless={false}>
        <KsButton
          kind="cancel"
          size="s"
          disabled={!hasChanges}
          handleTrigger={() => {
            setProps(propList);
            setSlots(slotList);
          }}
        >
          Cancel
        </KsButton>
        <KsButton
          kind="primary"
          size="s"
          disabled={!hasChanges}
          handleTrigger={() => {
            const newSlots = convertSlotData(slots);
            const newProps = convertPropData(props);
            const newSpec = {
              slots: newSlots,
              props: newProps,
            };
            const results = validateSpec(newSpec);
            if (results.ok) {
              dispatch(
                updateSpec({
                  patternId: pattern.id,
                  templateId: template.id,
                  spec: newSpec,
                }),
              );
            } else {
              setErrors(results.message.split('\n'));
            }
          }}
        >
          Save
        </KsButton>
      </KsButtonGroup>
      <KsSpecItems
        type={SpecItemTypes.Prop}
        handleAdd={() => {
          setProps(curProps => {
            const id = curProps.some(curProp => curProp.id === 'newProp')
              ? shortid.generate()
              : 'newProp';
            const newProp: StringPropTypeData = {
              id,
              type: PropTypeNames.string,
              isRequired: false,
              data: {
                type: 'string',
              },
            };

            return [...curProps, newProp];
          });
        }}
      >
        {props.map((prop, index) => {
          return (
            <KsSpecItem
              key={prop.id}
              index={index}
              id={prop.id}
              moveItem={moveProp}
              deleteItem={deleteProp}
              type={SpecItemTypes.Prop}
              // isInitiallyOpen={index === 0}
              handleNewId={newId => {
                setProps(curProps =>
                  produce(curProps, draft => {
                    draft = draft.map((curProp, i) => {
                      if (i !== index) return curProp;
                      curProp.id = removeSpaces(newId);
                      return curProp;
                    });
                  }),
                );
              }}
            >
              <KsPropEditor
                prop={prop}
                handleChange={newPropData => {
                  setErrors([]);
                  // `handleChange` is responsible for all merging of data; we assume nothing in this function
                  setProps(curProps =>
                    curProps.map((curProp, i) => {
                      if (i !== index) return curProp;
                      return newPropData;
                    }),
                  );
                }}
                key={prop.type}
              />
            </KsSpecItem>
          );
        })}
      </KsSpecItems>
      <hr />
      <KsSpecItems
        type={SpecItemTypes.Slot}
        handleAdd={() => {
          setSlots(curSlots => {
            const id = curSlots.some(curSlot => curSlot.id === 'newSlot')
              ? shortid.generate()
              : 'newSlot';
            return [
              ...curSlots,
              {
                id,
                data: { title: 'New Slot' },
              },
            ];
          });
        }}
      >
        {slots.map((slot, index) => {
          return (
            <KsSpecItem
              key={slot.id}
              index={index}
              id={slot.id}
              moveItem={moveSlot}
              deleteItem={deleteSlot}
              type={SpecItemTypes.Slot}
              // isInitiallyOpen={index === 0}
              handleNewId={newId => {
                setSlots(curSlots =>
                  curSlots.map((curSlot, i) => {
                    if (i !== index) return curSlot;
                    return {
                      ...curSlot,
                      data: {
                        ...curSlot.data,
                        title: newId, // temp convience
                      },
                      id: removeSpaces(newId),
                    };
                  }),
                );
              }}
            >
              <KsSlotEditor
                slot={slot}
                handleChange={newSlotData => {
                  setErrors([]);

                  // `handleChange` is responsible for all merging of data; we assume nothing in this function
                  setSlots(curSlots =>
                    curSlots.map((curSlot, i) => {
                      if (i !== index) return curSlot;
                      return newSlotData;
                    }),
                  );
                }}
              />
            </KsSpecItem>
          );
        })}
      </KsSpecItems>
    </div>
  );
};
