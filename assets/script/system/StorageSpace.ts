/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-06 17:34:04
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 23:54:12
 * @FilePath: \to-be-immortal\assets\script\system\StorageSpace.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, JsonAsset, game, find, Label, director } from 'cc';
import { em } from '../global/EventManager';
import { ItemManger } from './ItemManager';
const { ccclass, property } = _decorator;

@ccclass('StorageSpace')
export class StorageSpace extends Component {
    @property(JsonAsset)
    itemDataJson;

    _itemData = {};
    _IM: ItemManger;
    onDestroy() {
        em.remove("addItemToSS");
        em.remove("reduceItemFromSS");
        em.remove("itemIsEnough");
        em.remove("itemIsValid");
        em.remove("getItemList");
        em.remove("getItemDataByIdOrName");
        em.remove("getItemTotalByIdOrName");
        em.remove("getAllPills");
        em.remove("getItemsRewardByAds");
    }
    onLoad() {
        em.add("addItemToSS", this.addItemToSS.bind(this));
        em.add("reduceItemFromSS", this.reduceItemFromSS.bind(this));
        em.add("itemIsEnough", this.itemIsEnough.bind(this));
        em.add("itemIsValid", this.itemIsValid.bind(this));
        em.add("getItemList", this.getItemList.bind(this));
        em.add("getItemDataByIdOrName", this.getItemDataByIdOrName.bind(this));
        em.add("getItemTotalByIdOrName", this.getItemTotalByIdOrName.bind(this));
        em.add("getAllPills", this.getAllPills.bind(this));
        em.add("getItemsRewardByAds", this.getItemsRewardByAds.bind(this));
        this.initItemData();
        this._IM = new ItemManger();
        // this.schedule(this.showAll,1);
        director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点
    }
    initItemData() {
        let all = this.itemDataJson.json;
        all.forEach(element => {
            let id = element.id;
            let name = element.name;
            this._itemData[id] = element;
            this._itemData[name] = element;
        });
        // console.log("_itemData",this._itemData);
    }
    showAll() {
        console.log("_IM", this._IM);
    }
    //初始化仓库数据
    initSSData() {
        let data = em.dispatch("getTempData", "storageSpace");//读取缓存
        if (null !== data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    // this.addItemToSS(key, element, false);
                    this._IM.addItem(parseInt(key), element);
                }
            }
        }
    }
    start() {
        this.initSSData();
        this.addSomeItems();

        // this.helpAddItems();
        // this.helpAddItems2();

    }
    // 添加某些物品
    addSomeItems() {
        // this.addItemToSS("灵石", 10);
        // this.addItemToSS( "迷踪步",2);
        // this.addItemToSS( "万剑归冢",2);
        // this.addItemToSS( "一阶宝箱",999);
        // this.addItemToSS( "二阶宝箱",999);
        // this.addItemToSS( "三阶宝箱",999);
        // this.addItemToSS( "四阶宝箱",999);
        // this.addItemToSS("凝气术", 2);
        // this.addItemToSS("怒狮狂吼", 2);
        // this.addItemToSS("冰锥术", 2);
        // this.addItemToSS("剑雨术", 2);
        // this.addItemToSS("冰河世纪", 2);
        // this.addItemToSS("一剑隔世", 2);
        // this.addItemToSS("万剑归冢", 2);
        // this.addItemToSS("炼气丹", 5000);

        // this.addItemToSS("移形换影", 1);
        // this.addItemToSS("火行步", 1);
        // this.addItemToSS("飞雷神", 1);
        // this.addItemToSS("末日风暴", 1);
        // this.addItemToSS("八面危风", 1);
        // this.addItemToSS("如沐春风", 1);
        // this.addItemToSS("如沐春风", 1);
        // this.addItemToSS("灵风指", 1);
        // this.addItemToSS("御风术", 1);
        // this.addItemToSS("仙风云体", 1);

        // this.addItemToSS("化神丹", 99);
    }
    //辅助函数 用户测试添加物品
    helpAddItems() {
        this.addItemToSS("一阶宝箱", 99);
        this.addItemToSS("二阶宝箱", 99);
        this.addItemToSS("三阶宝箱", 99);
        this.addItemToSS("四阶宝箱", 99);
        this.addItemToSS("五阶宝箱", 99);
        this.addItemToSS("一阶功法残卷", 99);
        this.addItemToSS("一阶功法整卷", 99);
    }
    // 为n种物品添加m个
    helpAddItems2() {
        for (let i = 1; i < 75; i++) {
            // this.addItemToSS(i,1000);
            this.addItemToSS(i, 100);
        };
    }



    /**
     * @description: 通过id 或 name 获取物品属性 
     * @param {*} id_name 物品 id 或 name
     */
    getItemDataByIdOrName(id_name) {
        if (this._itemData.hasOwnProperty(id_name)) return this._itemData[id_name];
        else throw id_name + " of _itemData is null";
    }
    //判断物品id或名称是否有效
    itemIsValid(id_name){
        return this._itemData.hasOwnProperty(id_name);
    }
    //默认记录 添加的物品 isSaving = true；当初始化添加物品时
    addItemToSS(id_name, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) throw "id_name err,id is " + id_name + " item is err";
        let id = this._itemData[id_name].id;
        this._IM.addItem(id, total);
        em.dispatch("savingToTempData", "storageSpace", this.getItemList());

    }
    reduceItemFromSS(id_name, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) throw "id_name err,id_name is " + id_name + " item is err";
        let id = this._itemData[id_name].id;
        let result = this._IM.reduceItem(id, total);
        em.dispatch("savingToTempData", "storageSpace", this.getItemList());
        return result;
    }
    itemIsEnough(id_name, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) throw "id_name err,id_name is " + id_name + " item is err";
        let id = this._itemData[id_name].id;
        return this._IM.itemIsEnough(id, total);
    }
    getItemList() {
        return this._IM._itemList;
    }
    //获取指定id 或 名称的物品 的数量
    getItemTotalByIdOrName(id_name) {
        // console.log("getItemTotalByIdOrName",id_name);
        // console.log("this._itemData",this._itemData);
        if (!this._itemData.hasOwnProperty(id_name)) throw id_name + " of _itemData is null";
        let id = this._itemData[id_name].id;
        return this._IM.getItemTotal(id);
    }
    //获取已拥有的 所有丹药
    getAllPills() {
        let list = {};
        for (const id in this._IM._itemList) {
            if (Object.prototype.hasOwnProperty.call(this._IM._itemList, id)) {
                if (this._itemData[id].type2 == "丹药") {
                    list[id] = this._IM._itemList[id];
                };
            }
        }
        return list;
    }
    //通过广告获取物品奖励
    getItemsRewardByAds() {
        let data = em.dispatch("getTempData", "training");//读取缓存
        let t1 = 1;
        let t2 = 5+Math.random()*5|0;//最少5个 最多10个妖丹
        if (!data||data.curLv < 5) {
            this.addItemToSS("一阶宝箱", t1);
            this.addItemToSS("炼气丹", t2);
            let tips = "获得物品：一阶宝箱x"+t1+"、炼气丹x"+t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 15) {
            this.addItemToSS("二阶宝箱", t1);
            this.addItemToSS("筑基丹", t2);
            let tips = "获得物品：二阶宝箱x"+t1+"筑基丹x"+t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 31) {
            this.addItemToSS("三阶宝箱", t1);
            this.addItemToSS("金元丹", t2);
            let tips = "获得物品：三阶宝箱x"+t1+"金元丹x"+t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 47) {
            this.addItemToSS("四阶宝箱", t1);
            this.addItemToSS("元婴丹", t2);
            let tips = "获得物品：四阶宝箱x"+t1+"元婴丹x"+t2;
            em.dispatch("tipsViewShow", tips);
        } else {
            this.addItemToSS("五阶宝箱", t1);
            this.addItemToSS("化神丹", t2);
            let tips = "获得物品：五阶宝箱x"+t1+"化神丹x"+t2;
            em.dispatch("tipsViewShow", tips);
        };
        let ssNode = find("Canvas/menuLayer/HeroInfoLayer/storageSpace");
        if(ssNode.active){
            let script:any = find("Canvas/menuLayer/HeroInfoLayer").getComponent("HeroInfoLayer");
            script.updateStorageSpace();
        }
    }
}

