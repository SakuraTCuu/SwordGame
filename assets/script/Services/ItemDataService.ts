import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";

/**
 * 物品管理
 */
@Singleton
export class ItemDataService implements IService {

    public static readonly instance: ItemDataService;

    _itemList;

    public async initialize(): Promise<void> {
        this._itemList = {};
    }

    public async lazyInitialize(): Promise<void> {

    }

    // 添加物品
    addItem(id: number, total: number) {
        if (this._itemList.hasOwnProperty(id)) {
            this._itemList[id] += total;
        } else {
            this.addNewItemToList(id, total);
        }
    }

    // 添加新物品
    addNewItemToList(id: number, total: number) {
        this._itemList[id] = total;
    }

    /**
     * @description: 减少指定id物品的数量
     * @param {number} id 需要减少的物品id
     * @param {number} total 需要减少的物品数量
     * @returns {boolean} 减少物品是否成功 如果数量不够 或 物品不存在则失败
     */
    reduceItem(id: number, total: number) {
        if (this._itemList.hasOwnProperty(id)) {
            //判断是否够删除
            if (!this.itemIsEnough(id, total)) {
                return false;
            }
            this._itemList[id] -= total;
            if (this._itemList[id] === 0) {
                this.clearItemFromList(id);
            }
        } else {
            return false;
        }
        return true;
    }

    //判断物品数量是否足够
    itemIsEnough(id, total) {
        return this.getItemTotal(id) >= total;
    }

    // 清空物品
    clearItemFromList(id: number) {
        delete this._itemList[id];
    }

    //获取物品数量
    getItemTotal(id) {
        if (this._itemList.hasOwnProperty(id)) {
            return this._itemList[id]
        }
        return 0;
    }

}