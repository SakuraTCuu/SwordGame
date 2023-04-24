import { _decorator, Component, Node, find, Vec3, tween, Label, Tween } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;

// 主菜单新手引导
@ccclass('MainMenuGuide')
export class MainMenuGuide extends Component {
    @property(Node)
    guideFinger;
    @property([Node])
    btnArr;
    @property(Node)
    guideTipsBg;
    @property(Label)
    guideTipsLabel;

    _guideData = {
        "SelectStageLayer": false,
        "HeroInfoLayer": false,//角色界面总引导
        "HeroInfoLayerSpace": false,//仓库引导
        "HeroInfoLayerProperty": false,//属性引导
        "TrainingLayer": false,
        "MakePillsLayer": false,
        "SkillBookLayer": false,
    }
    onDestroy() {
        em.remove("getGuideData");
        em.remove("setGuideData");
        em.remove("initMainMenuByGuideData");
        em.remove("openGuideTips");
    }
    onLoad() {
        em.add("getGuideData", this.getGuideData.bind(this));
        em.add("setGuideData", this.setGuideData.bind(this));
        em.add("initMainMenuByGuideData", this.initMainMenuByGuideData.bind(this));
        em.add("openGuideTips", this.openGuideTips.bind(this));
    }
    start() {
        let data = em.dispatch("getTempData", "guideData");
        if (data) {
            for (const key in data) {//通过赋值的方式存取，可以在添加新属性时解决冲突问题
                if (Object.prototype.hasOwnProperty.call(data, key) && this._guideData.hasOwnProperty(key)) {
                    this._guideData[key] = data[key];
                }
            }
        }
        em.dispatch("savingToTempData", "guideData", this._guideData);
        this.initMainMenuByGuideData();
    }
    // 通过新手引导数据初始化主菜单
    initMainMenuByGuideData() {
        console.log("通过新手引导数据初始化主菜单");
        console.log("guide data", this._guideData);

        if (!this._guideData.SelectStageLayer) {
            this.hideBtnsFromIndexStart(1);
            find("Canvas/menuLayer/SelectStageLayer/guideSelectStage").active = true;
            this.guideTipsLabel.string = "点击关卡,开始游戏。\n海量怪兽等你挑战！";
            this.guideTipsBg.active = true;
            this._guideData.SelectStageLayer = true;
            em.dispatch("savingToTempData", "guideData", this._guideData);
        } else if (!this._guideData.HeroInfoLayer) {
            this.hideBtnsFromIndexStart(2);
            Tween.stopAllByTag(1);
            this.guideTipsLabel.string = "主角菜单包括仓库和属性。在仓库界面可以查看、使用、出售你的物品。在属性界面可以通过道法果提升自己的基础面板属性。";
            this.guideTipsBg.active = true;
            let node = find("Canvas/menuLayer/selectBtnPar/btn2");
            let wp = node.getWorldPosition();
            this.guideFinger.active = true;
            this.guideFinger.setWorldPosition(wp.x, wp.y + 150, wp.z);
            this.playGuideAnim1();
        } else if (!this._guideData.TrainingLayer) {
            this.hideBtnsFromIndexStart(3);
            Tween.stopAllByTag(1);
            let node = find("Canvas/menuLayer/selectBtnPar/btn3");
            let wp = node.getWorldPosition();
            this.guideFinger.active = true;
            this.guideFinger.setWorldPosition(wp.x, wp.y + 150, wp.z);
            this.playGuideAnim1();
        } else if (!this._guideData.MakePillsLayer) {
            this.hideBtnsFromIndexStart(4);
            Tween.stopAllByTag(1);
            let node = find("Canvas/menuLayer/selectBtnPar/btn4");
            let wp = node.getWorldPosition();
            this.guideFinger.active = true;
            this.guideFinger.setWorldPosition(wp.x, wp.y + 150, wp.z);
            this.playGuideAnim1();
        } else if (!this._guideData.SkillBookLayer) {
            this.hideBtnsFromIndexStart(5);
            Tween.stopAllByTag(1);
            let node = find("Canvas/menuLayer/selectBtnPar/btn5");
            let wp = node.getWorldPosition();
            this.guideFinger.active = true;
            this.guideFinger.setWorldPosition(wp.x, wp.y + 150, wp.z);
            this.playGuideAnim1();
        }
    }
    setGuideData(key, value = true) {
        if (this._guideData.hasOwnProperty(key)) {
            this._guideData[key] = value;
            em.dispatch("savingToTempData", "guideData", this._guideData);
        } else {
            throw "set guide data error." + key + " is invalid";
        }

    }
    //播放引导动画1
    playGuideAnim1() {
        let a1 = tween().by(0.5, { position: new Vec3(0, -100, 0) });
        let a2 = tween().by(0.5, { position: new Vec3(0, 100, 0) });
        let action = tween(this.guideFinger).sequence(a1, a2);
        action = tween(this.guideFinger).repeatForever(action);
        action.tag(1);
        action.start();
    }
    // 隐藏所有菜单按钮
    hideBtnsFromIndexStart(index) {
        for (let i = 0; i < this.btnArr.length; i++) {
            if (i >= index) this.btnArr[i].active = false;
            else this.btnArr[i].active = true;
        }
    }
    closeGuideTips() {
        this.guideTipsLabel.string = "";
        this.guideTipsBg.active = false;
    }
    //===========外部调用===========
    // 获取新手引导数据
    getGuideData() {
        return this._guideData;
    }
    //开启引导提示
    openGuideTips(content: string) {
        this.guideTipsLabel.string = content;
        this.guideTipsBg.active = true;
    }
}


