import {IDataTableService, IRowsColsResponse} from '../interfaces/dataTable';
import * as _ from 'lodash';

/**
 * @memberof miqStaticAssets.gtl
 * @ngdoc service
 * @name DataTableService
 * @param $http {ng.IHttpService} http service for fetching rows and columns of data table.
 * @param MiQEndpointsService {Object} service which holds endpoints to each data store.
 */
export default class DataTableService implements IDataTableService {
  private columns: any[];
  private rows: any[];
  private settings: any;
  /*@ngInject*/
  constructor(private $http: ng.IHttpService, private MiQEndpointsService: any) {}

  /**
   * Public method for fetching data from url combined from `MiQEndpointsService.rootPoint` and
   * `MiQEndpointsService.endpoints.listDataTable`. Result will be promise with type `IRowsColsResponse`. Which is
   * ```javascript
   * interface IRowsColsResponse {
   *  rows: any[];
   *  cols: any[];
   *  settings: ITableSettings;
   * }
   * ```
   * @methodOf miqStaticAssets.gtl
   * @memberof DataTableService
   * @function retrieveRowsAndColumnsFromUrl
   * @returns {ng.IPromise<IRowsColsResponse>} promise with type `IRowsColsResponse`.
   */
  public retrieveRowsAndColumnsFromUrl(modelName?: string,
                                       activeTree?: string,
                                       id?: string,
                                       isExplorer?: string,
                                       settings?: any,
                                       records?: any,
                                       additionalOptions?: any): ng.IPromise<IRowsColsResponse> {
    return this.fetchData(DataTableService.generateConfig(modelName,
                                                          activeTree,
                                                          id,
                                                          isExplorer,
                                                          settings,
                                                          records,
                                                          additionalOptions))
      .then(responseData => {
        this.columns = responseData.data.data.head;
        this.rows = responseData.data.data.rows;
        this.settings = responseData.data.settings;
        return {
          cols: this.columns,
          rows: this.rows,
          messages: responseData.data.messages,
          settings: responseData.data.settings
        };
      }
    );
  }

  /**
   * Method which will do actual http request using $http service.
   * @param config which contains config params.
   * @returns {IHttpPromise<any>} promise for later data filtering.
   */
  private fetchData(config: any): ng.IPromise<any> {
    return this.$http.post(
      this.MiQEndpointsService.rootPoint + this.MiQEndpointsService.endpoints.listDataTable,
      config
    );
  }

  /**
   * Static function which will generate http config from given variables.
   * @param modelName string with name of model (either association or current model).
   * @param activeTree string with active tree.
   * @param parentId ID of parent item.
   * @param isExplorer
   * @param settings
   * @param records
   * @param additionalOptions
   * @returns {{params: {}}} config object with params set.
   */
  public static generateConfig(modelName?: string,
                               activeTree?: string,
                               parentId?: string,
                               isExplorer?: string,
                               settings?: any,
                               records?: any,
                               additionalOptions?: any) {
    let config = {};
    _.assign(config, DataTableService.generateModelNameConfig(modelName));
    _.assign(config, DataTableService.generateActiveTreeConfig(activeTree));
    _.assign(config, DataTableService.generateParentIdConfig(parentId));
    _.assign(config, DataTableService.generateExplorerConfig(isExplorer));
    _.assign(config, DataTableService.generateParamsFromSettings(settings));
    _.assign(config, DataTableService.generateRecords(records));
    _.assign(config, DataTableService.generateAdditionalOptions(additionalOptions));
    return config;
  }

  /**
   * Static function for generating model object, this object will be assigned to `config.params`.
   * @param modelName name of currently selected model.
   * @returns {any|{modelName: any, model: any}} object if any model is selected.
   */
  private static generateModelNameConfig(modelName): any {
    return modelName && {model_name: modelName, model: modelName};
  }

  /**
   * Static function for generating active tree object, this object will be assigned to `config.params`.
   * @param activeTree name of currently selected tree.
   * @returns {any|{active_tree: any}} object if any tree is selected.
   */
  private static generateActiveTreeConfig(activeTree): any {
    return activeTree && {active_tree: activeTree};
  }

  /**
   * Static function for generating module id object, this object will be assigned to `config.params`.
   * @param parentId currently selected module's ID.
   * @returns {any|{parentId: any, model_id: any}} object if any module ID is present.
   */
  private static generateParentIdConfig(parentId): any {
    return parentId && parentId !== null && {parent_id: parentId, model_id: parentId};
  }

  /**
   *
   * @param isExplorer
   * @returns {any|boolean|{explorer: any}}
   */
  private static generateExplorerConfig(isExplorer): any {
    return isExplorer && isExplorer !== null && {explorer: isExplorer};
  }

  private static generateParamsFromSettings(settings): any {
    let params = {};
    if (settings) {
      _.assign(params, settings.current && {page: settings.current});
      _.assign(params, settings.perpage && {ppsetting: settings.perpage});
      _.assign(params, settings.sortBy && settings.sortBy.sortObject && {sort_choice: settings.sortBy.sortObject.text});
      _.assign(params, settings.sortBy && {is_ascending: !!settings.sortBy.isAscending});
    }
    return params;
  }

  private static generateRecords(records) {
    return records && records !== null && {'records[]': records, records: records};
  }

  private static generateAdditionalOptions(additionalOptions) {
    return additionalOptions && additionalOptions !== null && {'additional_options': additionalOptions};
  }
}
