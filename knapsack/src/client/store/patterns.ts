import produce from 'immer';
import shortid from 'shortid';
import slugify from 'slugify';
import { ThunkAction } from 'redux-thunk';
import { Action } from './types';
import { saveToServer } from './meta';
import {
  isDataDemo,
  isSlottedTemplateDemo,
  KnapsackPattern,
  KnapsackPatternsConfig,
  KnapsackPatternTemplate,
  KnapsackTemplateDemo,
  KsTemplateSpec,
} from '../../schemas/patterns';
import { KnapsackCustomPageSlice } from '../../schemas/custom-pages';
import {
  addSecondaryNavItem,
  deleteNavItem,
  Actions as NavActions,
} from './navs';
import { TemplateRendererMeta } from '../../schemas/knapsack-config';
import { BASE_PATHS } from '../../lib/constants';

type AppState = import('./index').AppState;

type PatternsState = {
  isFetching?: boolean;
  didInvalidate?: boolean;
  patterns: {
    [id: string]: KnapsackPattern;
  };
  renderers: {
    [id: string]: {
      meta: TemplateRendererMeta;
    };
  };
} & KnapsackPatternsConfig;

const initialState: PatternsState = {
  isFetching: false,
  didInvalidate: false,
  patterns: {},
  renderers: {},
};

const UPDATE_TEMPLATE_DEMO = 'knapsack/patterns/UPDATE_TEMPLATE_DEMO';
const REMOVE_TEMPLATE_DEMO = 'knapsack/patterns/REMOVE_TEMPLATE_DEMO';
const ADD_TEMPLATE_DATA_DEMO = 'knapsack/patterns/ADD_TEMPLATE_DATA_DEMO';
const ADD_TEMPLATE_TEMPLATE_DEMO =
  'knapsack/patterns/ADD_TEMPLATE_TEMPLATE_DEMO';
const ADD_TEMPLATE = 'knapsack/patterns/ADD_TEMPLATE';
const UPDATE_PATTERN = 'knapsack/patterns/UPDATE_PATTERN';
const ADD_PATTERN = 'knapsack/patterns/ADD_PATTERN';
const UPDATE_PATTERN_INFO = 'knapsack/patterns/UPDATE_PATTERN_INFO';
const UPDATE_TEMPLATE_INFO = 'knapsack/patterns/UPDATE_TEMPLATE_INFO';
const UPDATE_PATTERN_SLICES = 'knapsack/patterns/UPDATE_PATTERN_SLICES';

const DELETE_PATTERN = 'knapsack/patterns/DELETE_PATTERN';
interface DeletePatternAction extends Action {
  type: typeof DELETE_PATTERN;
  payload: {
    patternId: string;
  };
}
export function deletePattern({
  patternId,
}: DeletePatternAction['payload']): ThunkAction<
  void,
  AppState,
  {},
  Actions | NavActions
> {
  return (dispatch, getState) => {
    const navId = getState()?.navsState?.secondary?.find(
      navItem => navItem.path === `${BASE_PATHS.PATTERN}/${patternId}`,
    )?.id;
    const deleteAction: DeletePatternAction = {
      type: DELETE_PATTERN,
      payload: {
        patternId,
      },
    };
    dispatch(deleteAction);
    dispatch(
      deleteNavItem({
        id: navId,
        nav: 'secondary',
      }),
    );
  };
}

const DELETE_TEMPLATE = 'knapsack/patterns/DELETE_TEMPLATE';
interface DeleteTemplateAction extends Action {
  type: typeof DELETE_TEMPLATE;
  payload: {
    patternId: string;
    templateId: string;
  };
}

/** Delete a pattern's template */
export function deleteTemplate(
  payload: DeleteTemplateAction['payload'],
): DeleteTemplateAction {
  return {
    type: DELETE_TEMPLATE,
    payload,
  };
}

const UPDATE_SPEC = 'knapsack/patterns/Update Spec';
interface UpdateSpecAction extends Action {
  type: typeof UPDATE_SPEC;
  payload: {
    patternId: string;
    templateId: string;
    spec: KsTemplateSpec;
  };
}
export function updateSpec(
  payload: UpdateSpecAction['payload'],
): UpdateSpecAction {
  return {
    type: UPDATE_SPEC,
    payload,
  };
}

const DUPLICATE_DEMO = 'knapsack/patterns/Duplicate Demo';
interface DuplicateDemoAction extends Action {
  type: typeof DUPLICATE_DEMO;
  payload: {
    patternId: string;
    templateId: string;
    demoId: string;
    newDemoId?: string;
  };
}
export function duplicateDemo(
  payload: DuplicateDemoAction['payload'],
): DuplicateDemoAction {
  return {
    type: DUPLICATE_DEMO,
    payload,
  };
}

interface UpdatePatternSlicesAction extends Action {
  type: typeof UPDATE_PATTERN_SLICES;
  payload: {
    patternId: string;
    slices: KnapsackCustomPageSlice[];
  };
}

export function updatePatternSlices(
  patternId: string,
  slices: KnapsackCustomPageSlice[],
): UpdatePatternSlicesAction {
  return {
    type: UPDATE_PATTERN_SLICES,
    payload: {
      patternId,
      slices,
    },
  };
}

interface UpdateTemplateDemoAction extends Action {
  type: typeof UPDATE_TEMPLATE_DEMO;
  payload: {
    patternId: string;
    templateId: string;
    demo: KnapsackTemplateDemo;
  };
}

export function updateTemplateDemo({
  patternId,
  templateId,
  demo,
}: {
  patternId: string;
  templateId: string;
  demo: KnapsackTemplateDemo;
}): UpdateTemplateDemoAction {
  return {
    type: UPDATE_TEMPLATE_DEMO,
    payload: {
      patternId,
      templateId,
      demo,
    },
    meta: {
      autosaveDelay: 5000,
    },
  };
}

interface AddTemplateDataDemoAction extends Action {
  type: typeof ADD_TEMPLATE_DATA_DEMO;
  payload: {
    patternId: string;
    templateId: string;
    demoId?: string;
  };
}

interface AddTemplateAction extends Action {
  type: typeof ADD_TEMPLATE;
  payload: {
    patternId: string;
    templateId?: string;
    templateLanguageId: string;
    path: string;
    alias?: string;
    assetSetIds?: string[];
  };
}

export function addTemplate({
  path,
  alias,
  patternId,
  templateId,
  templateLanguageId,
  assetSetIds,
}: AddTemplateAction['payload']): ThunkAction<
  void,
  AppState,
  {},
  Actions | NavActions
> {
  return async (dispatch, getState) => {
    const globalAssetSetIds = getState()?.assetSetsState?.globalAssetSetIds;
    const assetSetId = Array.isArray(globalAssetSetIds)
      ? globalAssetSetIds[0]
      : null;
    const addTemplateAction: AddTemplateAction = {
      type: ADD_TEMPLATE,
      payload: {
        path,
        alias,
        patternId,
        templateId,
        templateLanguageId,
        assetSetIds,
      },
      meta: {
        autosaveDelay: 0,
      },
    };
    dispatch(addTemplateAction);
    return {
      templateId,
    };
  };
}

export function addTemplateDataDemo({
  patternId,
  templateId,
  demoId,
}: {
  patternId: string;
  templateId: string;
  demoId?: string;
}): AddTemplateDataDemoAction {
  return {
    type: ADD_TEMPLATE_DATA_DEMO,
    payload: {
      patternId,
      templateId,
      demoId,
    },
  };
}

interface AddTemplateTemplateDemoAction extends Action {
  type: typeof ADD_TEMPLATE_TEMPLATE_DEMO;
  payload: {
    patternId: string;
    templateId: string;
    path: string;
    alias?: string;
  };
}

export function addTemplateTemplateDemo({
  path,
  alias,
  patternId,
  templateId,
}: AddTemplateTemplateDemoAction['payload']): AddTemplateTemplateDemoAction {
  return {
    type: ADD_TEMPLATE_TEMPLATE_DEMO,
    payload: {
      path,
      alias,
      patternId,
      templateId,
    },
    meta: {
      autosaveDelay: 0,
    },
  };
}

interface RemoveTemplateDemoAction extends Action {
  type: typeof REMOVE_TEMPLATE_DEMO;
  payload: {
    patternId: string;
    templateId: string;
    demoId: string;
  };
}

/**
 * @todo add option to delete file (ifTemplateDemo)
 */
export function removeTemplateDemo({
  patternId,
  templateId,
  demoId,
}: {
  patternId: string;
  templateId: string;
  demoId: string;
}): RemoveTemplateDemoAction {
  return {
    type: REMOVE_TEMPLATE_DEMO,
    payload: {
      patternId,
      templateId,
      demoId,
    },
  };
}

interface UpdatePatternAction extends Action {
  type: typeof UPDATE_PATTERN;
  payload: KnapsackPattern;
}

export function updatePattern(pattern: KnapsackPattern): UpdatePatternAction {
  return {
    type: UPDATE_PATTERN,
    payload: pattern,
  };
}

interface UpdatePatternInfoAction extends Action {
  type: typeof UPDATE_PATTERN_INFO;
  payload: Partial<KnapsackPattern>;
}

interface UpdateTemplateInfoAction extends Action {
  type: typeof UPDATE_TEMPLATE_INFO;
  payload: {
    patternId: string;
    templateId: string;
    template: Partial<KnapsackPatternTemplate>;
  };
}

interface AddPatternAction extends Action {
  type: typeof ADD_PATTERN;
  payload: {
    patternId?: string;
    title: string;
  };
}

export function addPattern({
  patternId,
  title,
}: AddPatternAction['payload']): ThunkAction<
  void,
  AppState,
  {},
  Actions | NavActions
> {
  return async (dispatch, getState) => {
    const { secondary } = getState()?.navsState;
    const parentId =
      secondary.find(navItem => navItem.path === BASE_PATHS.PATTERNS)?.id ??
      'root';
    const id = patternId ?? slugify(title.toLowerCase());
    const pattern = {
      patternId: id,
      title,
    };
    const addPatternAction: AddPatternAction = {
      type: ADD_PATTERN,
      payload: pattern,
      meta: {
        autosaveDelay: 0,
      },
    };
    dispatch(addPatternAction);
    const addNavAction = addSecondaryNavItem({
      name: title,
      id,
      path: `${BASE_PATHS.PATTERN}/${id}`,
      parentId,
    });
    dispatch(addNavAction);
    return pattern;
  };
}

/**
 * Update basic Pattern Info
 * Basically everything besides `templates`
 */
export function updatePatternInfo(
  patternId: string,
  pattern: Partial<KnapsackPattern>,
): UpdatePatternInfoAction {
  return {
    type: UPDATE_PATTERN_INFO,
    payload: {
      id: patternId,
      ...pattern,
    },
  };
}

/**
 * Update basic Template Info by doing a shallow merge of `template`
 */
export function updateTemplateInfo({
  patternId,
  templateId,
  template,
}: {
  patternId: string;
  templateId: string;
  template: Partial<KnapsackPatternTemplate>;
}): UpdateTemplateInfoAction {
  return {
    type: UPDATE_TEMPLATE_INFO,
    payload: {
      patternId,
      templateId,
      template,
    },
    meta: {
      autosaveDelay: 5000,
    },
  };
}

type Actions =
  | AddPatternAction
  | DeletePatternAction
  | AddTemplateAction
  | UpdatePatternAction
  | UpdatePatternInfoAction
  | UpdateTemplateInfoAction
  | UpdateTemplateDemoAction
  | AddTemplateDataDemoAction
  | UpdatePatternSlicesAction
  | RemoveTemplateDemoAction
  | AddTemplateTemplateDemoAction
  | DuplicateDemoAction
  | DeleteTemplateAction
  | UpdateSpecAction;

export default function reducer(
  state = initialState,
  action: Actions,
): PatternsState {
  switch (action.type) {
    case UPDATE_PATTERN:
      return produce(state, draft => {
        draft.patterns[action.payload.id] = action.payload;
      });

    case DELETE_PATTERN:
      return produce(state, draft => {
        delete draft.patterns[action.payload.patternId];
      });

    case UPDATE_PATTERN_INFO:
      return produce(state, draft => {
        const pattern = state.patterns[action.payload.id];
        draft.patterns[action.payload.id] = {
          ...pattern,
          ...action.payload,
          // can't change the below
          templates: pattern.templates,
          id: pattern.id,
        };
      });

    case ADD_PATTERN:
      return produce(state, draft => {
        const { patternId, title } = action.payload;
        draft.patterns[patternId] = {
          id: patternId,
          title,
          templates: [],
        };
      });

    case ADD_TEMPLATE:
      return produce(state, draft => {
        const { patterns } = draft;
        const {
          alias,
          templateLanguageId,
          path,
          templateId,
          patternId,
          assetSetIds,
        } = action.payload;
        const { templates } = patterns[patternId];
        templates.push({
          id: templateId || templateLanguageId,
          title: templateId,
          path,
          alias,
          templateLanguageId,
          statusId:
            Array.isArray(draft?.templateStatuses) &&
            draft.templateStatuses.length > 0
              ? draft.templateStatuses[0].id
              : '',
          assetSetIds: assetSetIds ?? [],
          demosById: {
            main: {
              id: 'main',
              title: 'Main',
              type: 'data',
              data: {
                props: {},
                slots: {},
              },
            },
          },
          demos: ['main'],
        });
      });

    case UPDATE_TEMPLATE_INFO:
      return produce(state, draft => {
        const { patternId, templateId, template } = action.payload;
        const { templates } = draft.patterns[patternId];
        const oldTemplate = templates.find(t => t.id === templateId);
        Object.assign(oldTemplate, template);
      });

    case UPDATE_TEMPLATE_DEMO:
      return produce(state, draft => {
        const { templateId, patternId, demo } = action.payload;
        const pattern = draft.patterns[patternId];
        const template = pattern.templates.find(t => t.id === templateId);
        template.demosById[demo.id] = demo;
      });

    case ADD_TEMPLATE_DATA_DEMO:
      return produce(state, draft => {
        const { templateId, patternId, demoId } = action.payload;
        const pattern = draft.patterns[patternId];
        const template = pattern.templates.find(t => t.id === templateId);
        const id = demoId || shortid.generate();
        template.demosById[id] = {
          id,
          title: 'My New Demo',
          description: 'A description',
          type: 'data',
          data: {
            props: {},
            slots: {},
          },
        };
        template.demos.push(id);
      });

    case ADD_TEMPLATE_TEMPLATE_DEMO:
      return produce(state, draft => {
        const { patterns } = draft;
        const { alias, path, templateId, patternId } = action.payload;
        const template = patterns[patternId]?.templates.find(
          t => t.id === templateId,
        );
        const { demosById, demos } = template;
        const id = shortid.generate();

        // @todo get default props and add them as initial data
        demosById[id] = {
          id,
          title: 'My new template demo',
          type: 'template',
          templateInfo: {
            alias,
            path,
          },
        };
        demos.push(id);
      });

    case REMOVE_TEMPLATE_DEMO:
      return produce(state, draft => {
        const { templateId, patternId, demoId } = action.payload;
        const pattern = draft.patterns[patternId];
        const template = pattern.templates.find(t => t.id === templateId);
        delete template.demosById[demoId];
        template.demos = template.demos.filter(d => d !== demoId);

        // searching all other pattern demos to find any slots that used this demo.
        Object.values(draft.patterns).forEach(({ templates }) => {
          templates.forEach(t => {
            Object.values(t.demosById || {})
              .filter(isDataDemo)
              .filter(demo => demo.data?.slots)
              .forEach(demo => {
                Object.entries(demo.data.slots || {}).forEach(
                  ([slotName, slotDatas]) => {
                    demo.data.slots[slotName] = slotDatas.filter(slotData => {
                      if (isSlottedTemplateDemo(slotData)) {
                        if (
                          slotData.patternId === patternId &&
                          slotData.templateId === templateId &&
                          slotData.demoId === demoId
                        ) {
                          return false;
                        }
                      }
                      return true;
                    });
                  },
                );
              });
          });
        });
      });

    case UPDATE_PATTERN_SLICES:
      return produce(state, draft => {
        const { patternId, slices } = action.payload;
        const pattern = draft.patterns[patternId];
        pattern.slices = slices;
      });

    case DUPLICATE_DEMO:
      return produce(state, draft => {
        const { patternId, templateId, demoId, newDemoId } = action.payload;
        const template = draft.patterns[patternId]?.templates.find(
          t => t.id === templateId,
        );
        const id = newDemoId || shortid.generate();
        template.demos.push(id);
        template.demosById[id] = {
          ...template.demosById[demoId],
          id,
        };
      });

    case UPDATE_SPEC:
      return produce(state, draft => {
        const { patternId, templateId, spec } = action.payload;
        const template = draft.patterns[patternId]?.templates?.find(
          t => t.id === templateId,
        );
        if (!template) {
          throw new Error(
            `Could not find pattern "${patternId}" template "${templateId}"`,
          );
        }
        template.spec = spec;
      });

    case DELETE_TEMPLATE:
      return produce(state, draft => {
        const { patternId, templateId } = action.payload;
        const pattern = draft.patterns[patternId];
        if (!pattern) {
          throw new Error(`Could not find patternId "${patternId}"`);
        }
        pattern.templates = pattern.templates.filter(t => t.id !== templateId);
      });

    default:
      return {
        ...initialState,
        ...state,
      };
  }
}
