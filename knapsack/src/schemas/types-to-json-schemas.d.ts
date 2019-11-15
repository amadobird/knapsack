// To generate JSON schemas in the `./json` folder, place any types in here, then add them to the `typeNamesToExportToJsonSchema` array in `convert-types-to-json-schemas.js`
type KnapsackCustomPagesData = import('./custom-pages').KnapsackCustomPagesData;
type KnapsackSettings = import('./knapsack.settings').KnapsackSettings;
type KnapsackAssetSetsConfig = import('./asset-sets').KnapsackAssetSetsConfig;
type KnapsackPattern = import('./patterns').KnapsackPattern;
type KnapsackNavsConfig = import('./nav').KnapsackNavsConfig;

type KnapsackCustomPageSettingsForm = Pick<KnapsackCustomPagesData, 'sections'>;
