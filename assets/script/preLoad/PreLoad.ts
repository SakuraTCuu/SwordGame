import { _decorator, Component, director, Sprite, Label, Game, game, find, sys, Settings, profiler, EditBox } from 'cc';
import { em } from '../global/EventManager';
import { gUrl } from '../global/GameUrl';
import { ggd } from '../global/globalData';
import { hr } from '../global/HttpRequest';
const { ccclass, property } = _decorator;

@ccclass('PreLoad')
export class PreLoad extends Component {
    @property(Sprite)
    fillSprite;
    @property(Label)
    progressLabel;
    @property(Label)
    versionCode;

    _curAccountString: string;
    _curPasswordString: string;

    onLoad() {
        // console.log("sys.os", sys.os);
        // console.log("sys.osVersion", sys.osVersion);
        find("Canvas/gameName").active = true;
        find("Canvas/loadingProgressBg").active = true;
        director.preloadScene("mainMenu");
        // this.enterMainMenuScene();
        this.versionCode.string = ggd.versionCode;
    }
    onDestroy() {
        if (em.eventIsDefined("hideBanner")) em.dispatch("hideBanner");
    }
    start() {
        // profiler.hideStats();//关闭fps
    }
    //刷新加载进度
    updateLoadingProgress(fillRange) {
        if (fillRange <= this.fillSprite.fillRange) return;
        this.fillSprite.fillRange = fillRange;
        this.progressLabel.string = (fillRange * 100).toFixed(2) + "%";
        // this.progressLabel.string = (fillRange * 100)|0;
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
        find("Canvas/gameName").active = false;
        find("Canvas/loadingProgressBg").active = false;
        find("Canvas/loginLayer").active = true;
        //通过本地缓存信息显示登录信息
        let data: any = sys.localStorage.getItem("loginInfo");
        if (data) {
            console.log("账号密码输入框显示data 还没写");
            console.log("data", data);
            data = JSON.parse(data);
            find("Canvas/loginLayer/inputAccount").getComponent(EditBox).string = data.account;
            find("Canvas/loginLayer/inputPassword").getComponent(EditBox).string = data.password;
            this._curAccountString = data.account;
            this._curPasswordString = data.password;
        }
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
        find("Canvas/loading/Label").getComponent(Label).string = "登录中...";
        find("Canvas/loading").active = true;

    }
    loginComplete(res) {
        find("Canvas/loading").active = false; //出现报错
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
            em.dispatch("tipsViewShow", res.message);
        }
    }
    loginError() {
        find("Canvas/loading").active = false;
        em.dispatch("tipsViewShow", "网络异常，请重试或通过游客登录。");
    }
    loginTimeout() {
        find("Canvas/loading").active = false;
        em.dispatch("tipsViewShow", "网络延迟，请重试或通过游客登录。");
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
        find("Canvas/loading/Label").getComponent(Label).string = "注册中...";
        find("Canvas/loading").active = true;
    }
    registerComplete(res) {
        console.log("registerComplete", res);
        if (res.code == 200) {
            find("Canvas/loading").active = false;
            em.dispatch("tipsViewShow", "注册成功，请登录");
        } else {
            find("Canvas/loading").active = false;
            em.dispatch("tipsViewShow", res.message);
        }
    }
    registerError() {
        find("Canvas/loading").active = false;
        em.dispatch("tipsViewShow", "网络异常，请重试或通过游客登录。");
    }
    registerTimeout() {
        find("Canvas/loading").active = false;
        em.dispatch("tipsViewShow", "网络延迟，请重试或通过游客登录。");
    }
    onBtnAsVisitor() {
        ggd.userInfo.isVisitor = true;
        this.enterMainMenuScene();
    }
}

