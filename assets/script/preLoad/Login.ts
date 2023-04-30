import { _decorator, Component, director, EditBox, Label, Node, sys } from 'cc';
import IView from '../Interfaces/IView';
import { gUrl } from '../global/GameUrl';
import { hr } from '../global/HttpRequest';
import { ggd } from '../global/globalData';
import { Constant } from '../Common/Constant';
const { ccclass, property } = _decorator;


@ccclass('Login')
export class Login extends IView {

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

    protected onRegister?(...r: any[]): void {
        this.loginLayer.active = false;
        this.subscribe(Constant.EventId.loadingComplete, this.showLoginLayer, this, true);
    }
    protected onUnRegister?(...r: any[]): void {

    }

    onTick(delta: number): void {

    }

    start() {
    }

    showLoginLayer() {
        // let platform = "wx";
        // if (platform=="wx") {
        //     this.onBtnAsVisitor();
        //     return;
        // }

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

    //进入主界面场景
    enterMainMenuScene() {
        director.loadScene("mainMenu");
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
            this.dispatch(Constant.EventId.tipsViewShow, res.message);
        }
    }

    loginError() {
        this.loading.active = false;
        this.dispatch(Constant.EventId.tipsViewShow, "网络异常，请重试或通过游客登录。");
    }

    loginTimeout() {
        this.loading.active = false;
        this.dispatch(Constant.EventId.tipsViewShow, "网络延迟，请重试或通过游客登录。");
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
            this.dispatch(Constant.EventId.tipsViewShow, "注册成功，请登录");
        } else {
            this.loading.active = false;
            this.dispatch(Constant.EventId.tipsViewShow, res.message);
        }
    }

    registerError() {
        this.loading.active = false;
        this.dispatch(Constant.EventId.tipsViewShow, "网络异常，请重试或通过游客登录。");
    }

    registerTimeout() {
        this.loading.active = false;
        this.dispatch(Constant.EventId.tipsViewShow, "网络延迟，请重试或通过游客登录。");
    }

    onBtnAsVisitor() {
        ggd.userInfo.isVisitor = true;
        this.enterMainMenuScene();
    }

}


