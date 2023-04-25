import { _decorator, Component, Node, SpriteFrame, find, Sprite, Label, Color, Layers, director, sys, JsonAsset, native } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
import { EventId } from '../global/GameEvent';
import main from '../Main';
const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {

    @property([SpriteFrame])
    selectBtnSF: SpriteFrame[] = [];

    @property([Node])
    btnArr: Node[] = [];

    @property([SpriteFrame])
    menuBtnSF: SpriteFrame[] = [];

    @property(JsonAsset)
    trainingLvListJson: JsonAsset = null;

    @property(Node)
    versionNotice: Node = null;

    @property(Node)
    gets: Node = null;

    @property(Node)
    upgradeEquLvLayer: Node = null;;

    _layerNode = [];

    _SSLNode: Node = null;
    _HILNode: Node = null;
    _TLNode: Node = null;
    _MPNode: Node = null;
    _SBNode: Node = null;
    _PHNode: Node = null;
    _AINode: Node = null;

    _nickNameLabel: Label = null;
    _levelLabel: Label = null;
    _lingshiTotalLabel: Label = null;

    onDestroy() {
        em.remove(EventId.switchMainMenuLayer);
    }

    onLoad() {
        em.add(EventId.switchMainMenuLayer, this.onSelectBtn.bind(this));

        this.initView();

        this._layerNode.push(this._SSLNode, this._HILNode, this._TLNode, this._MPNode, this._SBNode, this._PHNode, this._AINode);

        this.onSelectBtn(null, "1");

        director.preloadScene("game");

        // 激活节点 注册事件
        this.versionNotice.active = true;
        this.versionNotice.active = false;
        this.gets.active = true;
        this.gets.active = false;

        // em.dispatch("directPlayAD","GameMonetize");
    }

    start() {
        this.initAccountInfo();
        this.initLvInfo();
        this.initLingshiTotal();
        // let lvData = this.trainingLvListJson.json;
    }

    initView() {
        this._SSLNode = find("Canvas/menuLayer/SelectStageLayer");
        this._HILNode = find("Canvas/menuLayer/HeroInfoLayer");
        this._TLNode = find("Canvas/menuLayer/TrainingLayer");
        this._MPNode = find("Canvas/menuLayer/MakePillsLayer");
        this._SBNode = find("Canvas/menuLayer/SkillBookLayer");
        this._PHNode = find("Canvas/menuLayer/PrizeHallLayer");
        this._AINode = find("Canvas/menuLayer/AddItemsLayer");

        this._nickNameLabel = find("Canvas/menuLayer/title/heroBaseInfoBg/nickname").getComponent(Label);
        this._levelLabel = find("Canvas/menuLayer/title/heroBaseInfoBg/curLv").getComponent(Label);
        this._lingshiTotalLabel = find("Canvas/menuLayer/title/lingshiTotalBg/total").getComponent(Label)
    }

    initAccountInfo() {
        let accountData: any = sys.localStorage.getItem("loginInfo");
        if (accountData) {
            accountData = JSON.parse(accountData);
            this._nickNameLabel.string = accountData.account;
        } else {
            this._nickNameLabel.string = "游客";
        }
    }

    initLvInfo() {
        let data = main.savingManager.getTempData("training");//读取缓存
        if (null === data) {
            this._levelLabel.string = "江湖好手";
        } else {
            let des = this.trainingLvListJson.json[data.curLv].name;
            this._levelLabel.string = des;
        }
    }

    initLingshiTotal() {
        let total = main.bagManager.getItemTotalByIdOrName("灵石");
        this._lingshiTotalLabel.string = total;
    }

    onSelectBtn(e: any, p: string) {
        this.updateBtnSF(parseInt(p) - 1);
        switch (p) {
            case "1":
                if (e !== null) em.dispatch("playOneShot", "common/进入试炼场");
                this.openLayer(this._SSLNode);
                break;
            case "2":
                if (e !== null) em.dispatch("playOneShot", "common/点击人物界面");
                this.openLayer(this._HILNode);
                break;
            case "3":
                if (e !== null) em.dispatch("playOneShot", "common/点击修行界面");
                this.openLayer(this._TLNode);
                break;
            case "4":
                if (e !== null) em.dispatch("playOneShot", "common/点击炼丹界面");
                this.openLayer(this._MPNode);
                break;
            case "5":
                if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._SBNode);
                break;
            case "6":
                // if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._PHNode);
                break;
            case "7":
                // if (e !== null) em.dispatch("playOneShot", "common/点击秘籍界面");
                this.openLayer(this._AINode);
                break;

            default:
                throw "p is err,current p is " + p;
        }
    }
    updateBtnSF(index) {
        this.btnArr.forEach((btn, i) => {
            if (i == index) {
                btn.getComponent(Sprite).spriteFrame = this.menuBtnSF[i * 2 + 1];
            } else {
                btn.getComponent(Sprite).spriteFrame = this.menuBtnSF[i * 2];
            }
        });
    }
    openLayer(node: Node) {
        this._layerNode.forEach(layer => {
            if (node == layer) layer.active = true;
            else layer.active = false;
        });
    }
    onBtnAds(e, p) {
        ggd.curAdRewardType = p;
        glf.playAd();
        // native.reflection.callStaticMethod("com/cocos/game/AppActivity", "createAds", "()V");
        // em.dispatch("getItemsRewardByAds");
    }
    // 打开装备升阶界面
    onBtnOpenUpgradeEquLvLayer() {
        this.upgradeEquLvLayer.active = true;
    }
    // 今日签到
    onBtnSignInToday() {
        em.dispatch("usingGameRewardFun", "signInToday");
    }
}

