import ModelService from '../Services/ModelService';


export default abstract class IModel {
    /**
     * Model名称
     * @type {string}
     * @memberof IModel
     */
    public get alias(): string {
        return this.constructor.name
    };

    /**
     * 监听数据变化
     * @param watchField 
     * @param onFieldChangeFn 
     * @param target 
     */
    public on(watchField: Array<keyof this>, onFieldChangeFn: ModelService.WatchCallback, target: any) {
        app.model.on(this, watchField, onFieldChangeFn, target)
    }


    /**
     * 取消监听
     * @param watchField 
     * @param onFieldChangeFn 
     * @param target 
     */
    public off(watchField: Array<keyof this>, onFieldChangeFn: ModelService.WatchCallback, target: any) {
        app.model.off(this, watchField, onFieldChangeFn, target)
    }

    /**
     * 取消监听
     * @param target 
     */
    public offTarget(target: any) {
        app.model.offTarget(this, target)
    }

}
