import Loadable from 'react-loadable';
import Spinner from '@basalt/bedrock-spinner';

export const LoadableComponentOverview = Loadable({
  loader: () =>
    import(/* webpackChunkName: "component-overview" */ './layouts/component-overview'),
  loading: Spinner,
});

export const LoadableHome = Loadable({
  loader: () =>
    import(/* webpackChunkName: "home" */ './components/home-splash.jsx'),
  loading: Spinner,
});

export const LoadablePatternEdit = Loadable({
  loader: () =>
    import(/* webpackChunkName: "pattern-edit" */ './pages/pattern-edit'),
  loading: Spinner,
});

export const LoadablePatternNew = Loadable({
  loader: () =>
    import(/* webpackChunkName: "pattern-new" */ './pages/pattern-new'),
  loading: Spinner,
});

export const LoadablePlayground = Loadable({
  loader: () =>
    import(/* webpackChunkName: "playground" */ './layouts/playground'),
  loading: Spinner,
});

export const LoadableExamplesPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "about-page" */ './components/examples-guide'),
  loading: Spinner,
});

export const LoadableDesignTokenPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "design-token-page" */ './components/design-tokens-filterable-grid'),
  loading: Spinner,
});

export const LoadableAnimations = Loadable({
  loader: () =>
    import(/* webpackChunkName: "animations" */ '@basalt/bedrock-transitions-demo'),
  loading: Spinner,
});

export const LoadableBreakpoints = Loadable({
  loader: () =>
    import(/* webpackChunkName: "breakpoints" */ './pages/design-tokens/breakpoints-page'),
  loading: Spinner,
});

export const LoadableColors = Loadable({
  loader: () =>
    import(/* webpackChunkName: "colors" */ '@basalt/bedrock-colors-demo'),
  loading: Spinner,
});

export const LoadableShadows = Loadable({
  loader: () =>
    import(/* webpackChunkName: "spacings" */ '@basalt/bedrock-shadows-demo'),
  loading: Spinner,
});

export const LoadableSpacings = Loadable({
  loader: () =>
    import(/* webpackChunkName: "spacings" */ '@basalt/bedrock-spacings-demo'),
  loading: Spinner,
});

export const LoadableTypography = Loadable({
  loader: () =>
    import(/* webpackChunkName: "typography" */ '@basalt/bedrock-typographies-demo'),
  loading: Spinner,
});

export const LoadablePatternsPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "patterns-page" */ './components/patterns-filterable-grid'),
  loading: Spinner,
});

export const LoadableSidebar = Loadable({
  loader: () =>
    import(/* webpackChunkName: "sidebar" */ './components/sidebar'),
  loading: Spinner,
});

export const LoadableSecondaryNav = Loadable({
  loader: () =>
    import(/* webpackChunkName: "secondary-nav" */
    './components/secondary-nav'),
  loading: Spinner,
});

export const LoadableSchemaTable = Loadable({
  loader: () =>
    import(/* webpackChunkName: "schema-table" */ '@basalt/bedrock-schema-table'),
  loading: Spinner,
});

export const LoadableVariationDemo = Loadable({
  loader: () =>
    import(/* webpackChunkName: "variation-demo" */ '@basalt/bedrock-variation-demo'),
  loading: Spinner,
});

export const LoadableDosAndDonts = Loadable({
  loader: () =>
    import(/* webpackChunkName: "dos-and-donts" */ '@basalt/bedrock-dos-and-donts'),
  loading: Spinner,
});

export const LoadableSettingsPage = Loadable({
  loader: () => import(/* webpackChunkName: "patterns-page" */ './settings'),
  loading: Spinner,
});

export const LoadableCustomSectionPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "custom-section-page" */ './layouts/custom-section-page'),
  loading: Spinner,
});
