import { _decorator, Component, Node, find, tween, Vec3, JsonAsset, Prefab, instantiate, Label, Sprite, NodePool, Animation, Color, Tween } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
import { LevelManager } from '../system/LevelManager';
const { ccclass, property } = _decorator;

@ccclass('TrainingLayer')
export class TrainingLayer extends Component {
    @property(JsonAsset)
    trainingLvListJson;
    @property(Prefab)
    pillPrefab;
    @property(Node)
    pillPar;
    @property(Sprite)
    expProgress;
    @property(Label)
    expProgressDescription;
    @property(Label)
    trainingLv;
    @property(Node)
    trainingBonusLabelPar;
    @property(Prefab)
    tipsPrefab;
    @property(Node)
    nothingLabel;
    @property(Node)
    guideFinger;

    _itemPrefabArr: Node[] = [];
    _trainingLvList;
    _rotationSpeed: number = 100;
    _pillList: Node;
    _isUpgrading: boolean = false;

    _curTrainingExp: number;
    _curTrainingLv: number;

    _TIM: LevelManager;
    onLoad() {

        this._pillList = find("pillList", this.node);
        this._trainingLvList = this.trainingLvListJson.json;
        // console.log("list", this._trainingLvList);
        plm.addPoolToPools("TLPillPrefab", new NodePool(), this.pillPrefab);
        let tipsTexPool = new NodePool();
        plm.addPoolToPools("tipsTex", tipsTexPool, this.tipsPrefab);
    }
    onEnable() {
        let guideData = em.dispatch("getGuideData");
        if (!guideData.TrainingLayer) {
            this.startTrainingLayerGuide();
        }
        this.updatePillsContent();
    }
    // 刷新药物列表
    updatePillsContent() {
        console.log("updatePillsContent");
        while (this._itemPrefabArr.length > 0) {
            let prefab = this._itemPrefabArr.shift();
            plm.putToPool("TLPillPrefab", prefab);
        }
        let pillList = em.dispatch("getAllPills");
        let count = 0;
        for (const id in pillList) {
            if (Object.prototype.hasOwnProperty.call(pillList, id)) {
                const total = pillList[id];
                // let pill = instantiate(this.pillPrefab);
                let pill = plm.getFromPool("TLPillPrefab");
                pill.parent = this.pillPar;
                let data = em.dispatch("getItemDataByIdOrName", id);
                pill.getChildByName("name").getComponent(Label).string = data.name;
                pill.getChildByName("total").getComponent(Label).string = total;
                let sprite = pill.getChildByName("sprite").getComponent(Sprite);
                let loadUrl = "images/items/" + data.loadUrl + "/spriteFrame";
                em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
                glf.createButton(this.node, pill, "TrainingLayer", "onBtnUsingPill", data.name);
                this._itemPrefabArr.push(pill);
                count++;
            }
        }
        if (count == 0) {
            this.nothingLabel.active = true;
        } else {
            this.nothingLabel.active = false;
        }
    }
    start() {
        this.initTrainingLv();
    }
    // 初始化修行等级
    initTrainingLv() {
        let data = em.dispatch("getTempData", "training");//读取缓存
        if (null === data) {
            this._curTrainingExp = 0;
            this._curTrainingLv = 0;
        } else {
            this._curTrainingLv = data.curLv;
            let exp = this._curTrainingLv > 0 ? this._trainingLvList[this._curTrainingLv - 1].exp : 0;
            this._curTrainingExp = data.curExp >= exp ? data.curExp : exp;
            console.log("读取列表 配置修为 还没写");
        }
        let obj = {
            "level": 0,
            "maxLevel": this._trainingLvList.length - 1,
            "curExp": 0,
            "levelMappingExpList": this._trainingLvList,
        };
        this._TIM = new LevelManager(obj);
        this._TIM.addExp(this._curTrainingExp);
        // console.log("_TIM",this._TIM);
        this.updateProgressView();
        this.savingTrainingData();
    }
    // 记录修行数据
    savingTrainingData() {
        let data = {
            "curExp": this._curTrainingExp,
            "curLv": this._curTrainingLv
        }
        em.dispatch("savingToTempData", "training", data);
    }
    //使用丹药
    onBtnUsingPill(e, p) {
        em.dispatch("playOneShot", "common/吃药");
        em.dispatch("reduceItemFromSS", p, 1);//使用丹药
        this.updatePillsContent();
        let exp: number;
        switch (p) {
            case "炼气丹":
                exp = 1;
                break;
            case "筑基丹":
                exp = 10;
                break;
            case "金元丹":
                exp = 200;
                break;
            case "元婴丹":
                exp = 4000;
                break;
            case "化神丹":
                exp = 80000;
                break;

            default:
                exp = 0;
                console.warn("尚未添加丹药" + p + "的经验值");
                break;
        }
        this._TIM.addExp(exp);
        this._curTrainingExp = this._TIM.curExp;
        // em.dispatch("tipsViewShow", "修为+" + exp);
        this.createTipsTex("修为+" + exp);
        this.updateProgressView();
        this.savingTrainingData();


        this.guideFinger.active = false;
        if (!em.dispatch("getGuideData").TrainingLayer) {
            this.startGuideUpgrade();
        }


    }
    updateProgressView() {
        // 获取到下一级的经验
        // let nextLvExp = this._trainingLvList[this._curTrainingLv+1].exp;
        let nextLvExp = this._trainingLvList[this._curTrainingLv].exp;
        let curLvExp = this._curTrainingLv > 0 ? this._trainingLvList[this._curTrainingLv - 1].exp : 0;
        console.log("nextLvExp", nextLvExp);
        console.log("curLvExp", curLvExp);
        console.log("this._curTrainingExp", this._curTrainingExp);
        console.log("this._curTrainingExp - curLvExp", this._curTrainingExp - curLvExp);

        let string = (this._curTrainingExp - curLvExp) + "/" + (nextLvExp - curLvExp);
        let data = this._trainingLvList[this._curTrainingLv];
        let par = this.trainingBonusLabelPar;
        this.expProgressDescription.string = string;
        this.expProgress.fillRange = (this._curTrainingExp - curLvExp) / (nextLvExp - curLvExp);
        this.trainingLv.string = data.name;
        find("Canvas/menuLayer/title/heroBaseInfoBg/curLv").getComponent(Label).string = data.name;
        par.getChildByName("l1").getComponent(Label).string = "血量加成：" + data.blood;
        par.getChildByName("l2").getComponent(Label).string = "伤害加成：" + data.damage;
        par.getChildByName("l3").getComponent(Label).string = "移速加成：" + data.moveSpeed;
    }
    onBtnUpgrade() {
        if (this._isUpgrading) {
            em.dispatch("tipsViewShow", "突破中...");
            return;
        }
        if (!this.isCanUpgrade()) {
            em.dispatch("tipsViewShow", "当前状态无法突破。");
            return;
        }
        this.guideFinger.active = false;
        this._isUpgrading = true;
        this._curTrainingLv++;
        this.playUpgradeAnim();
        this.savingTrainingData();


    }
    // 是否能够升级
    isCanUpgrade() {
        return this._TIM.level > this._curTrainingLv;
    }
    playUpgradeAnim() {
        console.log("播放突破动画");
        em.dispatch("playOneShot", "common/突破");
        let anim = find("training/animPar", this.node).getComponent(Animation);
        anim.play();
    }
    //播放完突破动画 恢复可突破状态
    afterPlayUpgradeAnim() {
        this._isUpgrading = false;
        this.updateProgressView();
        console.log("TrainingLayer",em.dispatch("getGuideData", "TrainingLayer"));
        
        if (!em.dispatch("getGuideData").TrainingLayer) {
            em.dispatch("setGuideData", "TrainingLayer", true);
            em.dispatch("initMainMenuByGuideData");
        }
    }


    //=================创建提示信息===============
    createTipsTex(content: string, initPos = { x: 0, y: 100 }) {
        let tex = plm.getFromPool("tipsTex");
        tex.getComponent(Label).string = content;
        tex.parent = find("Canvas/menuLayer/TrainingLayer/tipsPar");
        tex.setPosition(initPos.x, initPos.y, 0);
        this.playTIPSTeXEffect(tex);
    }
    playTIPSTeXEffect(tex, color = new Color(255, 255, 255, 255)) {
        let a1 = tween().by(1, { position: new Vec3(0, 200, 0) }, {
            onUpdate: (target, ratio) => {
                // if(ratio>0.5) tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), (ratio -0.5)*2);
                tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let a2 = tween().to(0.5, { scale: new Vec3(1.2, 1.2, 1) });
        let action = tween(tex).parallel(a1, a2)
            .call(() => {
                tex.setScale(new Vec3(1, 1, 1));
                plm.putToPool("tipsTex", tex, true);
            });
        action.start();
    }
    startTrainingLayerGuide() {
        let guideTips = "点击使用丹药，提升修为。当人物全身金黄时，说明修为已满，可以通过突破提升境界。越高阶的丹药提升的修为越高。丹药可以通过炼制丹药获取。";
        em.dispatch("openGuideTips", guideTips);
        find("Canvas/menuLayer/guideFinger").active = false;
        em.dispatch("addItemToSS", "炼气丹", 1);
        let tips = "获得物品炼气丹x1";
        em.dispatch("tipsViewShow", tips);
        this.updatePillsContent();
        let item = this._itemPrefabArr.length > 0 ? this._itemPrefabArr[0] : null;
        if (item) {
            Tween.stopAllByTag(3);
            let guide = this.guideFinger;
            guide.active = true;
            guide.parent = item;
            guide.setPosition(0, 150, 0);
            let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
            let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
            let action = tween(guide).sequence(a1, a2);
            action = tween(guide).repeatForever(action);
            action.tag(3);
            action.start();
        };
    }
    startGuideUpgrade() {
        let btn = find("Canvas/menuLayer/TrainingLayer/training/upgrade");
        if (btn) {
            Tween.stopAllByTag(3);
            let guide = this.guideFinger;
            guide.active = true;
            guide.parent = btn;
            guide.setPosition(0, 150, 0);
            let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
            let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
            let action = tween(guide).sequence(a1, a2);
            action = tween(guide).repeatForever(action);
            action.tag(3);
            action.start();
        };
    }
}

