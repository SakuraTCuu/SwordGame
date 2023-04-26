import IService from "../Interfaces/IService";
import IModel from "../Interfaces/IModel";
import Singleton from "../Decorators/Singleton";


//TODO: Rxjs 使用
/**
 * Model服务
 */
@Singleton
class ModelService implements IService {

    public static readonly instance: ModelService;

    // Model列表
    // private list: { [name: string]: { model: any, obs: { [k: string]: Subject<ModelService.WatchSubject> } } };
    // 模拟一个hash存储
    // private hashT: Map<string, Array<any>>;
    // 通过参数列表生成hash 存储subscription 用户取消代理
    // private subscriptionS: Map<string, Subscription>;

    // public async initialize() {
    //     this.list = {}
    //     this.hashT = new Map<string, Array<any>>();
    //     this.subscriptionS = new Map<string, Subscription>();
    // }

    public async initialize() {

    }

    public async lazyInitialize() {
    }
    // /**
    //  * 
    //  * @param field 
    //  * @param model 
    //  * @param f 
    //  * @param t 
    //  */
    // private hashCode(field, model, f, t) {
    //     for (const key of this.hashT.keys()) {
    //         const e = this.hashT.get(key);
    //         let o = [field, model, f, t];
    //         let isNew = false;
    //         if (o.length != e.length) {
    //             isNew = true;
    //         } else {
    //             for (let index = 0; index < e.length; index++) {
    //                 if (!Object.is(e[index], o[index])) {
    //                     isNew = true;
    //                     break;
    //                 }
    //             }
    //         }
    //         if (!isNew) return key;
    //     }

    //     let code = RandomHelper.getUUID();
    //     this.hashT.set(code, [field, model, f, t])
    //     return code;
    // }

    // /**
    //  *  监听数据变化
    //  * @param modelType 
    //  * @param watchField 
    //  * @param onFieldChangeFn 
    //  * @param target 
    //  */
    // public on<T extends IModel>(modelType: (new () => T) | T, watchField: Array<keyof T>, onFieldChangeFn: ModelService.WatchCallback, target: any) {
    //     const model = typeof modelType === 'function' ? this.getModel(modelType) : modelType;

    //     if (model == null) {
    //         return;
    //     }
    //     from(watchField)
    //         .pipe(
    //             skipWhile((v) => {

    //                 if (!(typeof v === "string")) return true;

    //                 return !this.list[model.alias] || !this.list[model.alias].obs[v];

    //             }),
    //             skipWhile((v) => {
    //                 // 跳过不是string类型的
    //                 if (!(typeof v === "string")) return true;

    //                 let hash = this.hashCode(v, model, onFieldChangeFn, target);

    //                 let sop = this.subscriptionS.get(hash);
    //                 if (!sop) {
    //                     sop = this.list[model.alias].obs[v]
    //                         ?.pipe(
    //                             debounceTime(100)
    //                         )
    //                         ?.subscribe((d: ModelService.WatchSubject) => {
    //                             Reflect.apply(onFieldChangeFn, target, [d.model, d.field, d.newVal, d.oldVal]);
    //                         });
    //                     this.subscriptionS.set(hash, sop);
    //                     return false;
    //                 }
    //                 return true;
    //             })
    //         )
    //         .subscribe((v) => {
    //             if (typeof v === "string")
    //                 this.noticeModelFieldUpdate(modelType, v, model[v], model[v]);
    //         });
    // }

    // /**
    //  *  取消监听
    //  * @param modelType 
    //  * @param watchField 
    //  * @param onFieldChangeFn 
    //  * @param target 
    //  */
    // public off<T extends IModel>(modelType: (new () => T) | T, watchField: Array<keyof T>, onFieldChangeFn: ModelService.WatchCallback, target: any) {
    //     const model = typeof modelType === 'function' ? this.getModel(modelType) : modelType;

    //     if (model == null) {
    //         return;
    //     }

    //     for (const field of watchField) {
    //         if (typeof field === "string") {

    //             let hash = this.hashCode(field, model, onFieldChangeFn, target);
    //             let sop = this.subscriptionS.get(hash);
    //             if (sop) {
    //                 sop.unsubscribe()
    //                 this.subscriptionS.delete(hash);
    //                 this.hashT.delete(hash);
    //             }
    //         }
    //     }
    // }

    // /**
    //  *  取消监听
    //  * @param modelType 
    //  * @param target 
    //  */
    // public offTarget<T extends IModel>(modelType: (new () => T) | T, target: any) {
    //     const model = typeof modelType === 'function' ? this.getModel(modelType) : modelType;

    //     if (model == null) {
    //         return;
    //     }
    //     //取消订阅的 和 Target 相关的 节点
    //     from(this.hashT)
    //         .pipe(
    //             skipWhile(([hash, hashOargs]) => {
    //                 return !Object.is(hashOargs[1], model) || !Object.is(hashOargs[3], target);
    //             })
    //         ).subscribe(([hash]) => {

    //             let sop = this.subscriptionS.get(hash);
    //             sop && sop.unsubscribe()

    //             this.subscriptionS.delete(hash);
    //             this.hashT.delete(hash);
    //         });
    // }


    // /**
    //  * 变更通知
    //  * @param modelType 
    //  * @param field 
    //  * @param newVal 
    //  * @param oldVal 
    //  */
    // private noticeModelFieldUpdate<T extends IModel>(modelType: (new () => T) | T, field: string | Symbol, newVal: any, oldVal: any) {
    //     const model = typeof modelType === 'function' ? this.getModel(modelType) : modelType;

    //     if (model == null) {
    //         return;
    //     }

    //     this.list[model.alias].obs[field.toString()]?.next({ model, field: field.toString(), newVal, oldVal })
    // }


    // /**
    //  * 获取Model
    //  * @param modelType 
    //  */
    // public getModel<T extends IModel>(modelType: new () => T): T {
    //     for (const key in this.list) {
    //         if (this.list[key].model instanceof modelType) {
    //             return this.list[key].model;
    //         }
    //     }

    //     return this.createModel(modelType);
    // }

    // /**
    //  * 创建Model
    //  * @param modelType 
    //  */
    // private createModel<T extends IModel>(modelType: new () => T): T {
    //     let t = new modelType();

    //     let model: T = this.bindProxy(t);

    //     const fields = Object.getOwnPropertyNames(model);

    //     let obs = {};
    //     fields.forEach((v) => {
    //         obs[v] = new Subject();
    //     });
    //     this.list[model.alias] = {
    //         obs,
    //         model
    //     }
    //     return model
    // }
    // /**
    //  * 设置代理
    //  * @param model 
    //  */
    // private bindProxy<T extends IModel>(model: T): T {
    //     let self = this;

    //     //处理 第一层级 Array 数据对象
    //     from(Object.getOwnPropertyNames(model))
    //         .pipe(
    //             skipWhile(
    //                 (field) => {
    //                     return !(model[field] instanceof Array);
    //                 }
    //             )
    //         )
    //         .subscribe((field) => {
    //             self.transDProxy(model, field);
    //         });
    //     //--Data-- 数据对象处理
    //     let p = new Proxy(model, {
    //         get(target, key, receiver) {
    //             return Reflect.get(target, key, receiver)
    //         },
    //         set(target, key, value, receiver) {
    //             // 通知更新
    //             self.noticeModelFieldUpdate(
    //                 model,
    //                 key,
    //                 value,
    //                 Reflect.get(target, key, receiver)
    //             );
    //             let ret = Reflect.set(target, key, value, receiver);

    //             if (value instanceof Array) {
    //                 self.transDProxy(model, key);
    //             }
    //             return ret;
    //         }
    //     })

    //     return p;
    // }
    // /**
    //  * 将数组Object 转换为Proxy
    //  */
    // private transDProxy(target: IModel, targetfield: string | symbol) {
    //     let self = this;
    //     let model = target;
    //     let field = targetfield;

    //     let t = new Proxy(model[field], {
    //         get(target, key, receiver) {
    //             return Reflect.get(target, key, receiver)
    //         },
    //         set(target, key, value, receiver) {
    //             let oldVal = Reflect.get(model, field);
    //             let n = Reflect.has(target, key);
    //             let ret = Reflect.set(target, key, value, receiver);
    //             // 通知更新 -- 这里通知的还是源targetfield数据
    //             !n && self.noticeModelFieldUpdate(
    //                 model,
    //                 field,
    //                 Reflect.get(model, field),
    //                 oldVal
    //             );
    //             return ret;
    //         }
    //     });

    //     Reflect.set(model, field, t);
    // }
}



namespace ModelService {
    export interface WatchCallback {
        (model: IModel, field: string, newVal: any, oldVal?: any): void
    };
    export interface WatchSubject {
        model: IModel, field: string, newVal: any, oldVal?: any
    }
}

export default ModelService;
