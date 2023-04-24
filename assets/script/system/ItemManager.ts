/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-06 17:21:02
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-09-29 17:04:50
 * @FilePath: \copy9train\assets\script\system\ItemManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
export { ItemManger }

//物品管理系统 
class ItemManger {
    _itemList = {};
    constructor() { }
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
            if (!this.itemIsEnough(id,total)) return false;
            this._itemList[id] -= total;
            if (this._itemList[id] === 0) this.clearItemFromList(id);
        } else {
            return false;
        }
        return true;
    }
    //判断物品数量是否足够
    itemIsEnough(id,total){
        return this._itemList.hasOwnProperty(id)&&this._itemList[id] >= total;
    }
    // 清空物品
    clearItemFromList(id: number) {
        delete this._itemList[id];
    }
    //获取物品数量
    getItemTotal(id) {
        if (this._itemList.hasOwnProperty(id)) return this._itemList[id]
        else return 0;
    }
}