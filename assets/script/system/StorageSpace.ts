import { JsonAsset } from 'cc';
import { em } from '../global/EventManager';
import { ItemManger } from './ItemManager';
import { director } from 'cc';
import main from '../Main';
import { EventId } from '../global/GameEvent';
import { resources } from 'cc';

export class StorageSpace {

    itemDataJson: JsonAsset = null;

    _itemData = {};

    _itemManager: ItemManger;

    constructor() { }

    lazyInitialize() {

        this._itemManager = main.itemManger;

        em.add(EventId.loadingComplete, this.lazyInitItemData, this);
    }

    lazyInitItemData() {
        // 物品表
        let resPath = "data/others/item"

        this.itemDataJson = main.dynamicLoading.getRes(resPath) as JsonAsset;

        // em.dispatchs(EventId.loadRes, resPath, (assets: JsonAsset) => {
        //     console.log(assets);
        //     this.itemDataJson = assets;
        // }, () => {
        //     console.log("load failed");
        // });

        this.initItemData();
        // this.schedule(this.showAll,1);
    }

    initItemData() {
        if (!this.itemDataJson) {
            return;
        }
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
        console.log("_itemManager", this._itemManager);
    }

    //初始化仓库数据
    initSSData() {
        let data = main.savingManager.getTempData("storageSpace");//读取缓存
        if (null !== data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    // this.addItemToBag(key, element, false);
                    this._itemManager.addItem(parseInt(key), element);
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
        // this.addItemToBag("灵石", 10);
        // this.addItemToBag( "迷踪步",2);
        // this.addItemToBag( "万剑归冢",2);
        // this.addItemToBag( "一阶宝箱",999);
        // this.addItemToBag( "二阶宝箱",999);
        // this.addItemToBag( "三阶宝箱",999);
        // this.addItemToBag( "四阶宝箱",999);
        // this.addItemToBag("凝气术", 2);
        // this.addItemToBag("怒狮狂吼", 2);
        // this.addItemToBag("冰锥术", 2);
        // this.addItemToBag("剑雨术", 2);
        // this.addItemToBag("冰河世纪", 2);
        // this.addItemToBag("一剑隔世", 2);
        // this.addItemToBag("万剑归冢", 2);
        // this.addItemToBag("炼气丹", 5000);

        // this.addItemToBag("移形换影", 1);
        // this.addItemToBag("火行步", 1);
        // this.addItemToBag("飞雷神", 1);
        // this.addItemToBag("末日风暴", 1);
        // this.addItemToBag("八面危风", 1);
        // this.addItemToBag("如沐春风", 1);
        // this.addItemToBag("如沐春风", 1);
        // this.addItemToBag("灵风指", 1);
        // this.addItemToBag("御风术", 1);
        // this.addItemToBag("仙风云体", 1);

        // this.addItemToBag("化神丹", 99);
    }
    //辅助函数 用户测试添加物品
    helpAddItems() {
        this.addItemToBag("一阶宝箱", 99);
        this.addItemToBag("二阶宝箱", 99);
        this.addItemToBag("三阶宝箱", 99);
        this.addItemToBag("四阶宝箱", 99);
        this.addItemToBag("五阶宝箱", 99);
        this.addItemToBag("一阶功法残卷", 99);
        this.addItemToBag("一阶功法整卷", 99);
    }
    // 为n种物品添加m个
    helpAddItems2() {
        for (let i = 1; i < 75; i++) {
            // this.addItemToBag(i,1000);
            this.addItemToBag(i + "", 100);
        };
    }

    /**
     * @description: 通过id 或 name 获取物品属性 
     * @param {*} id_name 物品 id 或 name
     */
    getItemDataByIdOrName(id_name) {
        if (this._itemData.hasOwnProperty(id_name)) {
            return this._itemData[id_name];
        }
        console.log(id_name + " of _itemData is null");
        return null;
    }

    //判断物品id或名称是否有效
    itemIsValid(id_name) {
        return this._itemData.hasOwnProperty(id_name);
    }

    /**
     * 默认记录 添加的物品 isSaving = true；当初始化添加物品时
     * @param id_name 物品名字
     * @param total 数量
     */
    addItemToBag(id_name: string, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) {
            throw "id_name err,id is " + id_name + " item is err";
        }
        let id = this._itemData[id_name].id;
        this._itemManager.addItem(id, total);

        main.savingManager.savingToTempData("storageSpace", this.getItemList());

    }
    reduceItemFromBag(id_name, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) throw "id_name err,id_name is " + id_name + " item is err";
        let id = this._itemData[id_name].id;
        let result = this._itemManager.reduceItem(id, total);
        main.savingManager.savingToTempData("storageSpace", this.getItemList());
        return result;
    }
    itemIsEnough(id_name, total: number) {
        if (!this._itemData.hasOwnProperty(id_name)) throw "id_name err,id_name is " + id_name + " item is err";
        let id = this._itemData[id_name].id;
        return this._itemManager.itemIsEnough(id, total);
    }
    getItemList() {
        return this._itemManager._itemList;
    }
    //获取指定id 或 名称的物品 的数量
    getItemTotalByIdOrName(id_name) {
        // console.log("this._itemData",this._itemData);
        if (!this._itemData.hasOwnProperty(id_name)) {
            // throw id_name + " of _itemData is null";
            console.log(id_name + " of _itemData is null");
            return null;
        }
        let id = this._itemData[id_name].id;
        return this._itemManager.getItemTotal(id);
    }
    //获取已拥有的 所有丹药
    getAllPills() {
        let list = {};
        for (const id in this._itemManager._itemList) {
            if (Object.prototype.hasOwnProperty.call(this._itemManager._itemList, id)) {
                if (this._itemData[id].type2 == "丹药") {
                    list[id] = this._itemManager._itemList[id];
                };
            }
        }
        return list;
    }
    //通过广告获取物品奖励
    getItemsRewardByAds() {
        let data = main.savingManager.getTempData("training");//读取缓存
        let t1 = 1;
        let t2 = 5 + Math.random() * 5 | 0;//最少5个 最多10个妖丹
        if (!data || data.curLv < 5) {
            this.addItemToBag("一阶宝箱", t1);
            this.addItemToBag("炼气丹", t2);
            let tips = "获得物品：一阶宝箱x" + t1 + "、炼气丹x" + t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 15) {
            this.addItemToBag("二阶宝箱", t1);
            this.addItemToBag("筑基丹", t2);
            let tips = "获得物品：二阶宝箱x" + t1 + "筑基丹x" + t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 31) {
            this.addItemToBag("三阶宝箱", t1);
            this.addItemToBag("金元丹", t2);
            let tips = "获得物品：三阶宝箱x" + t1 + "金元丹x" + t2;
            em.dispatch("tipsViewShow", tips);
        } else if (data.curLv < 47) {
            this.addItemToBag("四阶宝箱", t1);
            this.addItemToBag("元婴丹", t2);
            let tips = "获得物品：四阶宝箱x" + t1 + "元婴丹x" + t2;
            em.dispatch("tipsViewShow", tips);
        } else {
            this.addItemToBag("五阶宝箱", t1);
            this.addItemToBag("化神丹", t2);
            let tips = "获得物品：五阶宝箱x" + t1 + "化神丹x" + t2;
            em.dispatch("tipsViewShow", tips);
        };

        return;
        //TODO:  
        // let ssNode = find("Canvas/menuLayer/HeroInfoLayer/storageSpace");
        // if (ssNode.active) {
        //     let script: any = find("Canvas/menuLayer/HeroInfoLayer").getComponent("HeroInfoLayer");
        //     script.updateStorageSpace();
        // }
    }
}

