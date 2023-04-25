import { _decorator, Component, director, Sprite, Label, Game, game, find, sys, Settings, profiler, EditBox, Node } from 'cc';
import { em } from '../global/EventManager';
import { gUrl } from '../global/GameUrl';
import { ggd } from '../global/globalData';
import { hr } from '../global/HttpRequest';
import { EventId } from '../global/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('PreLoad')
export class PreLoad extends Component {
    @property({
        type: Label,
        displayName: "进度条背景图"
    })
    fillSprite: Sprite = null;

    @property({
        type: Label,
        displayName: "进度"
    })
    progressLabel = null;

    @property({
        type: Label,
        displayName: "版本号"
    })
    versionCode: Label = null;

    @property({
        type: Node,
        displayName: "游戏名Label"
    })
    gameName: Node = null;

    @property({
        type: Node,
        displayName: "进度条节点"
    })
    progressNode: Node = null;

    @property({
        type: Node,
        displayName: "登录Layer"
    })
    loginLayer: Node = null;

    @property({
        type: EditBox,
        displayName: "账户名输入框"
    })
    accountEditBox: EditBox = null;

    @property({
        type: EditBox,
        displayName: "密码输入框"
    })
    pwdEditBox: EditBox = null;

    @property({
        type: Node,
        displayName: "loading"
    })
    loading: Node = null;

    @property({
        type: Label,
        displayName: "loadingLabel"
    })
    loadingLabel: Label = null;

    _curAccountString: string;
    _curPasswordString: string;

    onLoad() {
        this.gameName.active = true;
        this.progressNode.active = true;

        director.preloadScene("mainMenu");

        // this.enterMainMenuScene();

        this.versionCode.string = ggd.versionCode;
    }

    onDestroy() {
        if (em.has(EventId.hideBanner)) {
            em.dispatchs(EventId.hideBanner);
        }
    }

    start() {
        // profiler.hideStats();//关闭fps
    }

    //刷新加载进度
    updateLoadingProgress(fillRange) {
        if (fillRange <= this.fillSprite.fillRange) return;
        this.fillSprite.fillRange = fillRange;
        this.progressLabel.string = (fillRange * 100).toFixed(2) + "%";
    }

    //进入主界面场景
    enterMainMenuScene() {
        director.loadScene("mainMenu");
    }

    showLoginLayer() {
        // let platform = "wx";
        // if (platform=="wx") {
        //     this.onBtnAsVisitor();
        //     return;
        // }

        this.gameName.active = false;
        this.progressNode.active = false;
        this.loginLayer.active = true;

        //通过本地缓存信息显示登录信息
        let data: any = sys.localStorage.getItem("loginInfo");
        if (!data) {
            return;
        }

        console.log("账号密码输入框显示data 还没写");
        console.log("data", data);
        data = JSON.parse(data);
        this.accountEditBox.string = data.account;
        this.pwdEditBox.string = data.password;

        this._curAccountString = data.account;
        this._curPasswordString = data.password;

    }

    inputAccount(box) {
        this._curAccountString = box.string;
    }

    inputPassword(box) {
        this._curPasswordString = box.string;
    }

    onBtnLogin() {
        let url = gUrl.list.login;
        let data = {
            "loginIdentity": this._curAccountString,
            "credential": this._curPasswordString,
        }
        let cb = this.loginComplete.bind(this);
        let eb = this.loginError.bind(this);
        let tb = this.loginTimeout.bind(this);
        hr.post(url, data, cb, eb, tb);
        this.loadingLabel.string = "登录中...";
        this.loading.active = true;
    }

    loginComplete(res) {

        this.loading.active = false;
        console.log("loginComplete", res);

        if (res.code == 200) {
            ggd.userInfo.isVisitor = false;
            ggd.userInfo.token = res.data.token;
            ggd.userInfo.accountMetadata = res.data.accountMetadata;
            // ggd.userInfo.token = res.data.data.token;
            // ggd.userInfo.accountMetadata = res.data.data.accountMetadata;
            //存储当前账号密码
            let data = {
                "account": this._curAccountString,
                "password": this._curPasswordString
            };
            sys.localStorage.setItem("loginInfo", JSON.stringify(data));
            this.enterMainMenuScene();
        } else {
            em.dispatchs(EventId.tipsViewShow, res.message);
        }
    }

    loginError() {
        this.loading.active = false;
        em.dispatchs(EventId.tipsViewShow, "网络异常，请重试或通过游客登录。");
    }

    loginTimeout() {
        this.loading.active = false;
        em.dispatchs(EventId.tipsViewShow, "网络延迟，请重试或通过游客登录。");
    }

    onBtnRegister() {
        let url = gUrl.list.register;
        let data = {
            "nickname": this._curAccountString,
            "password": this._curPasswordString,
        }
        let cb = this.registerComplete.bind(this);
        let eb = this.registerComplete.bind(this);
        let tb = this.registerTimeout.bind(this);
        hr.post(url, data, cb, eb, tb);

        this.loadingLabel.string = "注册中...";
        this.loading.active = true;
    }

    registerComplete(res) {
        console.log("registerComplete", res);
        if (res.code == 200) {
            this.loading.active = false;
            em.dispatchs(EventId.tipsViewShow, "注册成功，请登录");
        } else {
            this.loading.active = false;
            em.dispatchs(EventId.tipsViewShow, res.message);
        }
    }

    registerError() {
        this.loading.active = false;
        em.dispatchs(EventId.tipsViewShow, "网络异常，请重试或通过游客登录。");
    }

    registerTimeout() {
        this.loading.active = false;
        em.dispatchs(EventId.tipsViewShow, "网络延迟，请重试或通过游客登录。");
    }

    onBtnAsVisitor() {
        ggd.userInfo.isVisitor = true;
        this.enterMainMenuScene();
    }

}

