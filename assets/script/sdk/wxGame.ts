import { _decorator, Component, Node, director, sys } from 'cc';
import { em } from '../global/EventManager';
import { ggConfig, ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
const { ccclass, property } = _decorator;

@ccclass('WX_GAME')
export class WX_GAME extends Component {

    _videoAd = null;
    _bannerAd = null;
    _curAdIndex = 0;
    onLoad() {
        if (!ggd.isOpenAd) return;//没开启 直接停止初始化
        em.add("showWxVideoAd", this.showWxVideoAd.bind(this));
        em.add("showBanner", this.showBanner.bind(this));
        em.add("hideBanner", this.hideBanner.bind(this));
        // em.add("initRewardAdByPlayTimes", this.initRewardAdByPlayTimes.bind(this));
        //如果是微信小游戏
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            director.addPersistRootNode(this.node);
            this.init();
        }
    }

    /**
     * @description 初始化微信广告
     * @errorCode  
     * @code1000	后端接口调用失败
     * @code1001	参数错误
     * @code1002	广告单元无效
     * @code1003	内部错误
     * @code1004	无合适的广告
     * @code1005	广告组件审核中
     * @code1006	广告组件被驳回
     * @code1007	广告组件被封禁
     * @code1008	广告单元已关闭
    */
    init() {
        console.log("初始化微信场景");
        //初始化微信分享功能
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
        // this.initBannerAd();
        // this.initRewardAdByPlayTimes();
        this.initRewardAd();
    }
    initBannerAd() {
        // 创建 Banner 广告实例，提前初始化
        // let gap = (wx.getSystemInfoSync().screenWidth - 200) / 2;
        this._bannerAd = wx.createBannerAd({
            adUnitId: 'adunit-fa354a32215cecf4',
            style: {
                left: 0,
                top: wx.getSystemInfoSync().screenHeight - 100,
                // bottom:0,
                width: wx.getSystemInfoSync().screenWidth
            }
        });
        this._bannerAd.onLoad(() => {
            console.log('banner 广告加载成功');
        })
        this._bannerAd.onError(err => {
            console.log(err)
            switch (err.errCode) {
                case 1000:
                    console.log("后端接口调用失败");
                    em.dispatch("tipsViewShow", "后端接口调用失败");
                    break;
                case 1001:
                    console.log("参数错误");
                    em.dispatch("tipsViewShow", "参数错误");
                    break;
                case 1002:
                    console.log("广告单元无效");
                    em.dispatch("tipsViewShow", "广告单元无效");
                    break;
                case 1003:
                    console.log("内部错误");
                    em.dispatch("tipsViewShow", "内部错误");
                    break;
                case 1004:
                    console.log("无合适的广告");
                    em.dispatch("tipsViewShow", "无合适的广告");
                    break;
                case 1005:
                    console.log("广告组件审核中");
                    em.dispatch("tipsViewShow", "广告组件审核中");
                    break;
                case 1006:
                    console.log("广告组件被驳回");
                    em.dispatch("tipsViewShow", "广告组件被驳回");
                    break;
                case 1007:
                    console.log("广告组件被封禁");
                    em.dispatch("tipsViewShow", "广告组件被封禁");
                    break;
                case 1008:
                    console.log("广告单元已关闭");
                    em.dispatch("tipsViewShow", "广告单元已关闭");
                    break;
                default:
                    break;
            }
        });

        this._bannerAd.show();
    }
    // 在适合的场景显示 Banner 广告
    showBanner() {
        if (this._bannerAd) this._bannerAd.show();
    }
    hideBanner() {
        if (this._bannerAd) this._bannerAd.hide();
    }
    //直接初始化 进初始化一次
    initRewardAd() {
        // 创建激励视频广告实例，提前初始化
        this._videoAd = wx.createRewardedVideoAd({
            adUnitId: "adunit-4fd8f9b38c4adb1f",
        });

        this._videoAd.onLoad(() => {
            console.log('激励视频 广告加载成功')
        });
        this._videoAd.onError(err => {
            console.log(err)
            switch (err.errCode) {
                case 1000:
                    console.log("后端接口调用失败");
                    em.dispatch("tipsViewShow", "后端接口调用失败");
                    break;
                case 1001:
                    console.log("参数错误");
                    em.dispatch("tipsViewShow", "参数错误");
                    break;
                case 1002:
                    console.log("广告单元无效");
                    em.dispatch("tipsViewShow", "广告单元无效");
                    break;
                case 1003:
                    console.log("内部错误");
                    em.dispatch("tipsViewShow", "内部错误");
                    break;
                case 1004:
                    console.log("无合适的广告");
                    em.dispatch("tipsViewShow", "无合适的广告");
                    break;
                case 1005:
                    console.log("广告组件审核中");
                    em.dispatch("tipsViewShow", "广告组件审核中");
                    break;
                case 1006:
                    console.log("广告组件被驳回");
                    em.dispatch("tipsViewShow", "广告组件被驳回");
                    break;
                case 1007:
                    console.log("广告组件被封禁");
                    em.dispatch("tipsViewShow", "广告组件被封禁");
                    break;
                case 1008:
                    console.log("广告单元已关闭");
                    em.dispatch("tipsViewShow", "广告单元已关闭");
                    break;
                default:
                    break;
            }
            glf.afterPlayAdError();
        })

        this._videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                glf.afterPlayAdComplete();
            }
            else {
                // 播放中途退出，不下发游戏奖励
                console.log("播放中途退出，不下发游戏奖励");/*  */
                glf.afterPlayAdError();
            }
        });
    }
    //通过播放次数初始化广告
    initRewardAdByPlayTimes() {
        let index = this.getIndexByPlayTimes();
        let adUnitId = ggConfig.adUnitIds[index];

        // 创建激励视频广告实例，提前初始化
        this._videoAd = wx.createRewardedVideoAd({
            adUnitId: adUnitId
        });

        this._videoAd.onLoad(() => {
            console.log('激励视频 广告加载成功')
        });
        this._videoAd.onError(err => {
            console.log(err)
            switch (err.errCode) {
                case 1000:
                    console.log("后端接口调用失败");
                    em.dispatch("tipsViewShow", "后端接口调用失败");
                    break;
                case 1001:
                    console.log("参数错误");
                    em.dispatch("tipsViewShow", "参数错误");
                    break;
                case 1002:
                    console.log("广告单元无效");
                    em.dispatch("tipsViewShow", "广告单元无效");
                    break;
                case 1003:
                    console.log("内部错误");
                    em.dispatch("tipsViewShow", "内部错误");
                    break;
                case 1004:
                    console.log("无合适的广告");
                    em.dispatch("tipsViewShow", "无合适的广告");
                    break;
                case 1005:
                    console.log("广告组件审核中");
                    em.dispatch("tipsViewShow", "广告组件审核中");
                    break;
                case 1006:
                    console.log("广告组件被驳回");
                    em.dispatch("tipsViewShow", "广告组件被驳回");
                    break;
                case 1007:
                    console.log("广告组件被封禁");
                    em.dispatch("tipsViewShow", "广告组件被封禁");
                    break;
                case 1008:
                    console.log("广告单元已关闭");
                    em.dispatch("tipsViewShow", "广告单元已关闭");
                    break;
                default:
                    break;
            }
            glf.afterPlayAdError();
        })

        this._videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                ggd.playAdTimes++;
                let index = this.getIndexByPlayTimes();
                if (index !== this._curAdIndex) this.initRewardAdByPlayTimes();
                // 正常播放结束，可以下发游戏奖励
                glf.afterPlayAdComplete();
            }
            else {
                // 播放中途退出，不下发游戏奖励
                console.log("播放中途退出，不下发游戏奖励");/*  */
                glf.afterPlayAdError();
            }
        });
    }
    // 通过播放次数获得下标
    getIndexByPlayTimes() {
        let index = 0;
        if (ggd.playAdTimes > 3) index = 1;
        if (ggd.playAdTimes > 6) index = 2;
        return index;
    }

    // 展示视频广告
    showWxVideoAd() {
        // 用户触发广告后，显示激励视频广告
        this._videoAd.show().catch(() => {
            // 失败重试
            this._videoAd.load()
                .then(() => this._videoAd.show())
                .catch(err => {
                    console.log('激励视频 广告显示失败')
                });
        });


    }
}


