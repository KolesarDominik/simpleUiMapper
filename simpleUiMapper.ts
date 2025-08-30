type Key = string | number | symbol;

interface ApiValueMapper<ModelKey extends Key, Context = any> {
  value: (api: any, context: Context) => any;
  setApi: (model: Partial<Record<ModelKey, any>>, api: any, context: Context) => void;
}

export class ApiMapper<ModelKey extends Key, Context = any> {

  private rules: Record<ModelKey, string | ApiValueMapper<ModelKey, Context>>;
  private context!: Context;

  constructor(rules: Record<ModelKey, string | ApiValueMapper<ModelKey, Context>>, context?: Context) {
    this.rules = rules;
    if(context){
      this.context = context;
    }
  }

  public setContext(context: Context) {
    this.context = context;
  }

  public fromApiList(apiList: any[]) {
    return apiList.map(api => this.fromApi(api));
  }

  public toApiList(modelList: Partial<Record<ModelKey, any>>[], apiList: any[] = []) {
    return modelList.map((model, index) => this.toApi(model, apiList[index]));
  }

  public fromApi(api: any) {
    const result: Record<ModelKey, any> = {} as Record<ModelKey, any>;
    for (const modelKey in this.rules) {
      const rule = this.rules[modelKey];
      if (typeof rule === 'string') {
        result[modelKey] = getValueByPathArray(api, rule.split('.'));
      } else {
        const value = rule?.value(api, this.context);
          result[modelKey] = value;
      }
    }
    return result;
  }

  public toApi(model: Partial<Record<ModelKey, any>>, api: any = {}) {
    for (const key in this.rules) {
      const rule = this.rules[key];
      if (typeof rule === 'string') {
        assignByPathArray(api, rule.split('.'), model[key]);
      } else {
        rule?.setApi(model, api, this.context);
      }
    }
    return api;
  }
}
