import { _decorator, Component, Node, Sprite, SpriteFrame, Label, Material, RichText } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('UpgradeEquLvLayer')
export class UpgradeEquLvLayer extends Component {

    @property(Node)
    itemContent;
    @property(Node)
    curSelect;
    @property(Node)
    target;
    @property(Node)
    maskPar;
    @property(Material)
    grayMaterial;
    @property(Material)
    defaultMaterial;
    @property([SpriteFrame])
    itemQBg: SpriteFrame[] = [];
    @property([Node])
    materialNode: Node[] = [];

    _itemPrefabArr = [];
    _curSelectItemData;
    _canUpgrade: boolean = false;

    _materialList = {
        2: {
            "灵石": 1000,
            "炼气丹": 20
        },
        3: {
            "灵石": 10000,
            "筑基丹": 40
        },
        4: {
            "灵石": 100000,
            "金元丹": 100
        },
        5: {
            "灵石": 100000,
            "元婴丹": 200
        }
    }
    onLoad() {
        glf.createButton(this.node, this.curSelect, "UpgradeEquLvLayer", "onBtnEqu");
        glf.createButton(this.node, this.target, "UpgradeEquLvLayer", "onBtnEqu");
    }
    onEnable() {
        this.updateEquList();
    }
    onDisable() {
        this.recoveryDefault();
    }
    // 恢复默认状态
    recoveryDefault() {
        for (const node of this.materialNode) {
            node.getComponent(Sprite).spriteFrame = null;
            node.getChildByName("Label").getComponent(Label).string = "";
        };
        this.curSelect.getChildByName("Sprite").getComponent(Sprite).spriteFrame = null;
        this.target.getChildByName("Sprite").getComponent(Sprite).spriteFrame = null;
        this.curSelect.getComponent(Sprite).spriteFrame = this.itemQBg[0];
        this.target.getComponent(Sprite).spriteFrame = this.itemQBg[0];
        this.curSelect.getChildByName("Label").getComponent(Label).string = "";
        this.target.getChildByName("Label").getComponent(Label).string = "";
        this.curSelect.data = null;
        this.target.data = null;

        this._canUpgrade = false;
        this._curSelectItemData = null;
    }
    // 刷新装备列表
    updateEquList() {
        while (this._itemPrefabArr.length > 0) {
            let prefab = this._itemPrefabArr.shift();
            plm.putToPool("SSLItemPrefab", prefab);
        }
        let list = em.dispatch("getItemList");
        for (const key in list) {
            let data = em.dispatch("getItemDataByIdOrName", key);
            if (data.type == "装备") {
                let total = list[key];
                let prefab = plm.getFromPool("SSLItemPrefab");
                prefab.parent = this.itemContent;
                prefab.getChildByName("itemBg").getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
                this.initPrefabLv(prefab, data);
                let sprite = prefab.getChildByName("sprite").getComponent(Sprite);
                let loadUrl: string = data.loadUrl;
                if (!data.loadUrl) loadUrl = "item_default";
                loadUrl = "images/items/" + loadUrl + "/spriteFrame";
                em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets, () => {
                    em.dispatch("loadTheDirResources", "images/items/item_default/spriteFrame", (assets) => sprite.spriteFrame = assets);
                });
                // prefab.getChildByName("total").getComponent(Label).string = "X" + total;
                prefab.getChildByName("total").getComponent(Label).string = total;
                // prefab.getChildByName("name").getComponent(Label).string = data.name;
                prefab.itemName = data.name;//用于索引
                this._itemPrefabArr.push(prefab);
                glf.createButton(this.node, prefab.getChildByName("itemBg"), "UpgradeEquLvLayer", "onBtnItemInUpgradeEquLvLayer", key);
            }
        }
    }
    // 初始化物品等级
    initPrefabLv(prefab, data) {
        let label = prefab.getChildByName("lv").getComponent(Label);
        if (data.type == "装备" && data.lv) {
            console.log("初始化阶");
            let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
            label.string = list[data.lv];
        } else label.string = "";
    }
    // 在升阶界面 点击item
    onBtnItemInUpgradeEquLvLayer(e, p) {
        let data = em.dispatch("getItemDataByIdOrName", p);
        console.log("onBtnItemInUpgradeEquLvLayer", data);
        if (data.lv >= 5) {
            em.dispatch("tipsViewShow", "已达到最大等级，无法升级。");
            return;
        };
        let data2 = this.getEquNextLvData(data.name, data.lv);
        console.log("data2", data2);
        this._curSelectItemData = data;
        //初始化背景
        this.curSelect.getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
        this.target.getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
        this.curSelect.data = data;
        this.target.data = data2;
        // 初始化物品图片
        let loadUrl: string = data.loadUrl;
        if (!data.loadUrl) loadUrl = "item_default";
        loadUrl = "images/items/" + loadUrl + "/spriteFrame";
        em.dispatch("loadTheDirResources", loadUrl, (assets) => {
            this.curSelect.getChildByName("Sprite").getComponent(Sprite).spriteFrame = assets;
            this.target.getChildByName("Sprite").getComponent(Sprite).spriteFrame = assets;
        }, () => {
            em.dispatch("loadTheDirResources", "images/items/item_default/spriteFrame", (assets) => {
                this.curSelect.getChildByName("Sprite").getComponent(Sprite).spriteFrame = assets;
                this.target.getChildByName("Sprite").getComponent(Sprite).spriteFrame = assets;
            });
        });
        //初始化阶
        let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
        this.curSelect.getChildByName("Label").getComponent(Label).string = list[data.lv];
        this.target.getChildByName("Label").getComponent(Label).string = list[data.lv + 1];
        //升阶材料
        let materials = this._materialList[data.lv + 1];
        let count = 0;
        this._canUpgrade = true;
        for (const key in materials) {
            if (Object.prototype.hasOwnProperty.call(materials, key)) {
                const total = materials[key];
                let mData = em.dispatch("getItemDataByIdOrName", key);
                console.log("需要" + key + "x" + total);
                let node = this.materialNode[count];
                let isEnough = em.dispatch("itemIsEnough", key, total);
                if (isEnough) node.getComponent(Sprite).material = this.defaultMaterial;
                else {
                    node.getComponent(Sprite).material = this.grayMaterial;
                    this._canUpgrade = false;
                }
                node.getChildByName("Label").getComponent(Label).string = "x" + total;
                let loadUrl = "images/items/" + mData.loadUrl + "/spriteFrame";
                em.dispatch("loadTheDirResources", loadUrl, (assets) => {
                    node.getComponent(Sprite).spriteFrame = assets;
                }, () => {
                    em.dispatch("loadTheDirResources", "images/items/item_default/spriteFrame", (assets) => {
                        node.getComponent(Sprite).spriteFrame = assets;
                    });
                });
                count++;
            };
        };
    }
    //升阶
    onBtnUpgradeLv() {
        if (!this._curSelectItemData) {
            em.dispatch("tipsViewShow", "请先选择装备，再点击升阶！");
            return;
        }
        if (!this._canUpgrade) {
            em.dispatch("tipsViewShow", "材料不足，无法升阶。");
            return;
        }
        //消耗合成材料
        let materials = this._materialList[this._curSelectItemData.lv + 1];
        for (const key in materials) {
            if (Object.prototype.hasOwnProperty.call(materials, key)) {
                const total = materials[key];
                em.dispatch("reduceItemFromSS", key, total);
            }
        }
        em.dispatch("reduceItemFromSS", this._curSelectItemData.name, 1);
        let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
        let targetLv = list[this._curSelectItemData.lv + 1];
        let index = this._curSelectItemData.name.indexOf("（");
        let targetName = this._curSelectItemData.name.slice(0, index + 1) + targetLv + "）";
        console.log("targetName", targetName);

        em.dispatch("addItemToSS", targetName, 1);
        let gets = {};
        gets[targetName] = 1;
        em.dispatch("showGets", gets);
        this.recoveryDefault();
        //刷新物品
        this.updateEquList();
    }
    onBtnEqu(e) {
        let data = e.target.data;
        if (!data) return;
        let colorStr = this.getColorStrByQuality(data.quality - 1);
        this.maskPar.getChildByName("name").getComponent(RichText).string = colorStr + data.name + "</color>";
        this.maskPar.getChildByName("description").getComponent(RichText).string = data.description;
        console.log("onBtnEqu",data);
        
        this.showEquDetail(data.name);
        this.maskPar.active = true;
    }
    showEquDetail(equName) {
        let data = em.dispatch("usingHeroBasePropertyFun", "getEquDataByName", equName);
        let effects = data.qData.effect;
        //根据quality 设置颜色 还没写
        let string = "";
        for (const id of effects) {
            let effect = em.dispatch("usingHeroBasePropertyFun", "getEquEffectData", id);
            console.log("effect", effect);
            // let colorStr = this.getColorStrByQuality(effect.quality - 1);
            let colorStr = this.getColorStrByType(effect.type - 1);
            string = string + colorStr + effect.name + ":" + effect.description + "</color>\n";
        }
        if (data.lData.baseDamage) string = string + "基础伤害:+" + data.lData.baseDamage + "\n";
        if (data.lData.damageTimes) string = string + "伤害加成倍数:+" + data.lData.damageTimes + "\n";
        if (data.lData.attackInterval) string = string + "攻击间隔:" + data.lData.attackInterval + "\n";
        if (data.lData.blood) string = string + "血量:+" + data.lData.blood + "\n";
        if (data.lData.CHR) string = string + "暴击率:+" + data.lData.CHR + "\n";
        if (data.lData.moveSpeed) string = string + "移动速度:+" + data.lData.moveSpeed + "\n";
        this.maskPar.getChildByName("description").getComponent(RichText).string = string;
    }
    // 通过物品品质 获得 物品颜色值
    getColorStrByType(index) {
        index > 2 ? 2 : index;
        return ["<color=#757575>", "<color=#A474CF>", "<color=#DDA75A>"][index];
    }
    getColorStrByQuality(index) {
        index > 4 ? 4 : index;
        return ["<color=#599A65>", "<color=#728CC7>", "<color=#A474CF>", "<color=#C65C37>", "<color=#DDA75A>"][index];
        // return ["<color=#7EFFA7>","<color=#7EEAFF>","<color=#837EFF>","<color=#FFB77E>","<color=#FFE000>"][index];
    }
    onBtnClose() {
        em.dispatch("usingHeroInfoLayerFun", "updateStorageSpace");
        this.node.active = false;
    }
    onBtnCloseEquDetail() {
        this.maskPar.active = false;
    }
    // 获取下一阶物品物品数据
    getEquNextLvData(curName, curLv) {
        let index = curName.indexOf("（");
        let name = curName.slice(0, index);
        let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
        let lvStr = list[curLv + 1];
        if (!lvStr) throw "lvStr is error";
        let nextName = name + "（" + lvStr + "）";
        return em.dispatch("getItemDataByIdOrName", nextName);
    }
}


