import { createContext, useContext } from 'react';
import {
  KnapsackPatternTemplate,
  KnapsackTemplateDemo,
  KsTemplateSpec,
} from '../../../schemas/patterns';
import { KsRenderResults } from '../../../schemas/knapsack-config';

export type CurrentTemplateData = {
  patternId: string;
  pattern: KnapsackPattern;
  templateId: string;
  template: KnapsackPatternTemplate;
  assetSetId: string;
  title: string;
  demo: KnapsackTemplateDemo;
  demos: KnapsackTemplateDemo[];
  templateInfo: KsRenderResults & { url: string };
  spec: KsTemplateSpec;
  canEdit: boolean;
  isLocalDev: boolean;
  hasSchema: boolean;
};

export const CurrentTemplateContext = createContext<
  Partial<CurrentTemplateData>
>({});

export const useCurrentTemplateContext = () =>
  useContext(CurrentTemplateContext);
