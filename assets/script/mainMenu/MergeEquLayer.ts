import { _decorator, Component, Node, Label, Sprite, SpriteFrame, RichText } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('MergeEquLayer')
export class MergeEquLayer extends Component {
    @property(Node)
    itemContent;
    @property(Node)
    curSelect;
    @property(Node)
    target;
    @property(Label)
    totalLabel;
    @property(Label)
    mergeDetailLabel;
    @property(Node)
    maskPar;
    @property([SpriteFrame])
    itemQBg: SpriteFrame[] = [];

    _itemPrefabArr = [];
    _mergeList = {
        "1": 5,
        "2": 10,
        "3": 10,
        "4": 5,
        "5": 0
    };
    onLoad() {
        glf.createButton(this.node, this.curSelect, "MergeEquLayer", "onBtnEqu");
        glf.createButton(this.node, this.target, "MergeEquLayer", "onBtnEqu");
    }
    onEnable() {
        this.updateEquList();
    }
    onDisable() {
        this.curSelect.data = null;
        this.target.data = null;
        this.mergeDetailLabel.string = "";
        this.totalLabel.string = "";
    }
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
                glf.createButton(this.node, prefab.getChildByName("itemBg"), "MergeEquLayer", "onBtnItemInMergeLayer", key);
            }
        }
    }
    // 合成
    onBtnItemInMergeLayer(e, p) {
        let data = em.dispatch("getItemDataByIdOrName", p);
        if (data.quality >= 5) {
            em.dispatch("tipsViewShow", "当前品质为最高品质，不可提升");
            return;
        }
        let data2 = this.getMergeTargetData(data.name);
        console.log("merge1", data);
        console.log("merge2", data2);
        this.curSelect.getComponent(Sprite).spriteFrame = this.itemQBg[data.quality - 1];
        this.target.getComponent(Sprite).spriteFrame = this.itemQBg[data2.quality - 1];
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
        // this.curSelect.getChildByName("Label").getComponent(Label).string = list[data.lv];
        this.curSelect.getChildByName("Label").getComponent(Label).string = "";
        this.target.getChildByName("Label").getComponent(Label).string = list[data.lv];
        this.totalLabel.string = "x" + this._mergeList[data.quality];
        this.showMergeDetail(data.name);
    }
    // 合成装备
    onBtnMerge() {
        //判断材料是否足够
        let curTotal = this.getCurEquTotal(this.curSelect.data.name);
        let needTotal = this._mergeList[this.curSelect.data.lv];
        if (curTotal >= needTotal) {
            console.log("合成");
            this.consumeEqu(this.curSelect.data.name, needTotal);
            em.dispatch("addItemToSS", this.target.data.name, 1);
            let gets = {};
            gets[this.target.data.name] = 1;
            em.dispatch("showGets", gets);
            this.updateEquList();
            this.showMergeDetail(this.curSelect.data.name);
        } else {
            em.dispatch("tipsViewShow", "升品失败，材料数量不足");
        }
    }
    consumeEqu(curName, needTotal) {
        let index = curName.indexOf("（");
        let lvArr = ["（一阶）", "（二阶）", "（三阶）", "（四阶）", "（五阶）", "（六阶）", "（七阶）", "（八阶）", "（九阶）"];
        for (const lv of lvArr) {
            let name = curName.slice(0, index) + lv;
            let total = em.dispatch("getItemTotalByIdOrName", name);
            if (total > 0) {
                if (needTotal <= total) {
                    em.dispatch("reduceItemFromSS", name, needTotal);
                    break;
                } else {
                    needTotal -= total;
                    em.dispatch("reduceItemFromSS", name, total);
                }
            }
        }
        console.log("消耗完成");
    }
    // 展示合成详情
    showMergeDetail(curName) {
        let index = curName.indexOf("（");
        let lvArr = ["（一阶）", "（二阶）", "（三阶）", "（四阶）", "（五阶）", "（六阶）", "（七阶）", "（八阶）", "（九阶）"];
        let string = "";
        for (const lv of lvArr) {
            let name = curName.slice(0, index) + lv;
            let total = em.dispatch("getItemTotalByIdOrName", name);
            if (total > 0) string = string + name + "x" + total + "\n";
        }
        this.mergeDetailLabel.string = string;
    }
    //获取某装备总数
    getCurEquTotal(curName) {
        let index = curName.indexOf("（");
        let lvArr = ["（一阶）", "（二阶）", "（三阶）", "（四阶）", "（五阶）", "（六阶）", "（七阶）", "（八阶）", "（九阶）"];
        let total = 0;
        for (const lv of lvArr) {
            let name = curName.slice(0, index) + lv;
            total += em.dispatch("getItemTotalByIdOrName", name);
        }
        return total;
    }
    // 获得合成目标数据
    getMergeTargetData(curName) {
        let list = { "破旧": "实用", "实用": "稀有", "稀有": "传说", "传说": "史诗" };
        console.log("curName", curName);
        console.log("curName.slice(0,2)", curName.slice(0, 2));
        console.log("list[curName.slice(0,2)]", list[curName.slice(0, 2)]);

        let pre = list[curName.slice(0, 2)];

        if (!pre) throw "target is no existent";
        let targetName = pre + curName.slice(2);
        return em.dispatch("getItemDataByIdOrName", targetName);
    }
    // 初始化物品等级
    initPrefabLv(prefab, data) {
        let label = prefab.getChildByName("lv").getComponent(Label);
        if (data.type == "装备" && data.lv) {
            let list = { 1: "一阶", 2: "二阶", 3: "三阶", 4: "四阶", 5: "五阶", 6: "六阶", 7: "七阶", 8: "八阶", 9: "九阶" };
            label.string = list[data.lv];
        } else label.string = "";
    }
    onBtnEqu(e) {
        let data = e.target.data;
        if (!data) return;
        let colorStr = this.getColorStrByQuality(data.quality - 1);
        this.maskPar.getChildByName("name").getComponent(RichText).string = colorStr + data.name + "</color>";
        this.maskPar.getChildByName("description").getComponent(RichText).string = data.description;
        console.log("onBtnEqu", data);
        this.showEquDetail(data.name);
        this.maskPar.active = true;
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
    onBtnOpen() {
        this.node.active = true;
    }
    onBtnClose() {
        em.dispatch("usingHeroInfoLayerFun", "updateStorageSpace");
        this.node.active = false;
    }
}


