import { assetManager, Button, CCClass, Color, color, Component, easing, Enum, error, EventHandler, Graphics, ImageAsset, isValid, Layers, log, Node, pipeline, RenderTexture, size, Sprite, SpriteFrame, Texture2D, tween, Tween, UIOpacity, UITransform, Vec3, Widget, _decorator } from "cc";
import { DEBUG, EDITOR } from "cc/env";
import MegaUI from "../Decorators/MegaUI";
import UIHelper from "../Helpers/UIHelper";


const { property, ccclass, executeInEditMode } = _decorator;

@ccclass
@executeInEditMode
abstract class IUI extends UIHelper.IUIBase {

    mIsShow: boolean = false;
    @property({
    })
    uiOpt: UIHelper.IUIOption = IUI.UIOption.CreateForUI();

    // 控制参数
    private mID: string = null;
    public get ID(): string { return this.mID; };
    private mDelayTime: number = -1;
    // 根节点
    private mRoot: Node = null;
    //窗口节点 实际的窗口大小 (内容区域大小)
    private mWinNode: Node = null;
    //窗口颜色层	
    private mModelColorLayer: Node = null;
    // 参数列表
    private createArgs: [] = [];

    onLoad() {
        if (EDITOR) {
            return;
        }
        this.uiOpt.updateUiAniEnumInEditor();

        let args = Array.prototype.slice.call(this.createArgs || [], 1);
        if (this.onRegister) {
            this.onRegister.apply(this, args);
        }
        //父类执行
        super.onLoad();
    }

    onDestroy() {
        //父类执行
        super.onDestroy();
        if (EDITOR) {
            return;
        }
        if (this.onUnRegister) {
            this.onUnRegister();
        }
    }
    /**
     * 参见prefab实例的时候调用  （被加入到节点前调用）
     * @param id 
     */
    create(id: string) {

        this.mID = id;
        let root = this.node;
        this.mIsShow = false;


        this.mRoot = root;
        this.mWinNode = root.getChildByName("panel") || root.getChildByName("Panel");

        this.setOption();
        this.mDelayTime = this.uiOpt.autoHideTime;
    }

    /**
     * 初始化create结束前调用 （被加入到节点前调用）
     * @param r 参数列表
     */
    createFinish(...r) {
        if (this.uiOpt.autoHideTime > -1) {
            this.mDelayTime = this.uiOpt.autoHideTime;
        }
        this.createArgs = Array.prototype.slice.call(arguments);
        let zorder = null;
        if (this.uiOpt.zOrder) zorder = this.uiOpt.zOrder;
        this.uiOpt.parent = this.uiOpt.parent || app.ui.getZorderLayer(zorder);
        if (!(this.uiOpt.parent instanceof Node)) {
            this.uiOpt.parent = app.ui.getZorderLayer();
        }
        this.uiOpt.parent.addChild(this.node);

        this.setupUIMode();

        if (this.uiOpt.uiModelType == UIHelper.DMT.Model) {
            let node = this.mModelColorLayer = new Node("ModelColorLayer");
            node.layer = Layers.Enum.UI_2D;
            let nodeTransform = node.addComponent(UITransform);
            let opacity = node.addComponent(UIOpacity);
            opacity.opacity = UIHelper.UIMaskColorGray;
            let sp = node.addComponent(Sprite);
            sp.type = Sprite.Type.SIMPLE;
            sp.sizeMode = Sprite.SizeMode.CUSTOM;

            let texture = new Texture2D();
            texture.reset({
                width: 1,
                height: 1,
                format: Texture2D.PixelFormat.RGBA8888,
            })
            texture.uploadData(new Uint8Array([0, 0, 0, 255]));
            texture.updateMipmaps();

            let spframe = new SpriteFrame();
            spframe.texture = texture;
            sp.spriteFrame = spframe;
            spframe.packable = false;

            let wg = node.addComponent(Widget);
            wg.isAlignLeft = true;
            wg.isAlignBottom = true;
            wg.isAlignRight = true;
            wg.isAlignTop = true;
            wg.alignMode = Widget.AlignMode.ALWAYS;

            node.parent = this.mRoot;
            node.setSiblingIndex(0);
            wg.updateAlignment();
        }
    }
    /**
     * 重置UI配置参数
     * @param p
     */
    resetOption(p: UIHelper.IUIOption) {
        if (!this.uiOpt || !p) return;
        for (const key in p) {
            this.uiOpt[key] = p[key];
        }
    }

    /**
     * 通过窗口类型处理 事件拦截
     */
    private setupUIMode() {
        let touchBtn: Button = undefined;
        if (this.uiOpt.uiModelType == UIHelper.DMT.Transparent) {
            if (this.mWinNode) {
                this.mWinNode.removeComponent(Button);
            }
            this.mRoot.removeComponent(Button);
        }
        else if (this.uiOpt.uiModelType == UIHelper.DMT.Normal) {
            if (this.mWinNode) {
                touchBtn = this.mWinNode.addComponent(Button);
                this.mRoot.removeComponent(Button);
            }
            else {
                touchBtn = this.mRoot.addComponent(Button);
            }
        }
        else { //模态窗口
            touchBtn = this.mRoot.addComponent(Button);
        }
        if (touchBtn) {
            touchBtn.clickEvents

            let onClicked = new EventHandler();
            onClicked.target = this.node;
            onClicked.component = "IUI";
            onClicked.handler = "_onUIModeEvent";

            touchBtn.clickEvents.push(onClicked);
        }
    }

    /**
     * 获得焦点 失去焦点前的一次调用
     * 多次触发多次被调用
     * @param r
     */
    async show(...r) {
        this.setVisible(false);
        var isShow = arguments[0];

        this.mIsShow = isShow;
        this.onShow.apply(this, Array.prototype.slice.call(arguments));
        if (!this.mRoot || !isValid(this.mRoot))
            return true;

        // 执行界面动画
        let ani = null;
        if (isShow) {
            this.setVisible(true);
            ani = MegaUI.CreateUIAni(this.uiOpt.uiShowAni);
            if (this.mWinNode && ani) {
                Tween.stopAllByTarget(this.mWinNode);
                ani.Actions(this.mWinNode)
                    .call(() => {
                        this.showFinish(true);
                    })
                    .start();
            } else {
                this.scheduleOnce(() => {
                    this.showFinish(true);
                }, 0)
            }
        }
        else {
            this.setVisible(true);
            ani = MegaUI.CreateUIAni(this.uiOpt.uiHideAni);
            if (this.mWinNode && ani) {
                Tween.stopAllByTarget(this.mWinNode);
                ani.Actions(this.mWinNode)
                    .call(() => {
                        this.showFinish(false);
                    })
                    .start();
            } else {
                this.scheduleOnce(() => {
                    this.showFinish(false);
                }, 0)
            }
        }
        return true;
    }
    /**
     * show结束后调用
     */
    private showFinish(isShow) {
        //如果有持续时间的 直接到只需时间直接关闭
        if (isShow && this.mDelayTime > -1) {
            this.unschedule(this.close);
            this.scheduleOnce(this.close, this.mDelayTime);
        }

        app.ui.doShowFinish(this, isShow);
    }

    /**
     * 接收窗口层面的点击事件
     */
    private _onUIModeEvent() {
        if (this.uiOpt.isClickOutClose) {
            this.close();
        }
    }
    /**
     * 显示UI 从UI栈内从新弹出
     * @param params
     */
    open(params) {
        var args = [];
        if (arguments.length > 0) {
            args = [this];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
        }
        app.ui.showUI.apply(app.ui, args);
    }
    /**
     * 关闭UI
     * @param backUI
     */
    close(delayTime?: number) {
        if (this.mDelayTime)
            this.mDelayTime = this.uiOpt.autoHideTime;
        app.ui.removeUI(this);
    }
    /**
     * 移除，真正从  渲染队列 -  时间观察中  里移除
     * @param claen 
     * @returns 
     */
    remove(claen?: boolean) {
        claen = claen === false ? false : true;

        this.onUnRegister();
        if (!claen) {
            this.setVisible(false);
            return;
        } else {
            if (this.node) {
                Tween.stopAllByTarget(this.node);
                this.node.destroy();
                this.destroy();
                this.mRoot = undefined;
            }
        }
        log(this.mID + " removed !!")
    }

    setVisible(flag: boolean) {
        this.node.active = flag;
    }

    isVisible() {
        return this.node.active;
    }
    /**
     * 重置Model
     */
    resetModel(v: boolean) {
        this.mModelColorLayer.active = v;
    }
    //override
    /**
     * 设定界面类型 参考UIConfig 参数
     */
    protected setOption() { }





    /**
    * 注册后/注销前 操作  通过isShow控制
    * @param isShow
    * @param more
    */
    protected abstract onShow(isShow: boolean, ...more): any;



}

namespace IUI {
    //窗口属性

    @ccclass("UIConfig_Option")
    export class UIOption implements UIHelper.IUIOption {
        @property({
            tooltip: "自动释放(默认自动释放)\n对于多次频繁被打开的UI可以设置此属性为false"
        })
        isAutoRelease: boolean = false;
        @property({
            type: Enum(UIHelper.LayerZOrder),
            tooltip: "可以自定义窗口层 默认最高层"
        })
        zOrder: UIHelper.LayerZOrder = undefined;

        parent: Node = undefined;
        @property({
            type: Enum(UIHelper.DMT),
            tooltip: "窗口模态类型"
        })
        uiModelType: UIHelper.DMT = undefined;
        @property({
            tooltip: "点击空白处隐藏",
            visible() {
                return this.uiModelType == UIHelper.DMT.Model;
            }
        })
        isClickOutClose: boolean = undefined;
        @property({
            tooltip: "自动隐藏延迟时间 默认不自动隐藏"
        })
        autoHideTime: number = undefined;

        @property({
            visible: false
        })
        uiShowAni: string = ""
        @property({
            type: Enum(MegaUI.AniEnum()),
            tooltip: "界面打开动画效果"
        })
        set ShowAni(v: number) {
            if (!EDITOR && DEBUG) {
                error("【UIOption】")
            }
            this.uiShowAni = this._enumAnimation[v];
        }
        get ShowAni(): number {
            if (!EDITOR && DEBUG) {
                error("【UIOption】")
            }
            return this._enumAnimation[this.uiShowAni]
        }

        @property({
            visible: false
        })
        uiHideAni: string = ""
        @property({
            type: Enum(MegaUI.AniEnum()),
            tooltip: "界面关闭动画效果"
        })
        set HideAni(v: number) {
            if (!EDITOR && DEBUG) {
                error("【UIOption】")
            }
            this.uiHideAni = this._enumAnimation[v];
        }
        get HideAni(): number {
            if (!EDITOR && DEBUG) {
                error("【UIOption】")
            }
            return this._enumAnimation[this.uiHideAni]
        }

        private _enumAnimation = {} as any;
        updateUiAniEnumInEditor() {
            if (EDITOR) {
                this._enumAnimation = Enum({});
                Object.assign(this._enumAnimation, MegaUI.AniEnum() || Enum({ default: -1 }));
                Enum.update(this._enumAnimation);

                CCClass.Attr.setClassAttr(this, 'ShowAni', 'type', 'Enum');
                CCClass.Attr.setClassAttr(this, 'ShowAni', 'enumList', Enum.getList(this._enumAnimation));

                CCClass.Attr.setClassAttr(this, 'HideAni', 'type', 'Enum');
                CCClass.Attr.setClassAttr(this, 'HideAni', 'enumList', Enum.getList(this._enumAnimation));

            }
        }

        reset() {
            this.isAutoRelease = true;
            this.zOrder = UIHelper.LayerZOrder.UI;
            this.parent = null;
            this.uiModelType = UIHelper.DMT.Model;
            this.isClickOutClose = false;
            this.autoHideTime = -1;
            this.uiShowAni = undefined;
            this.uiHideAni = undefined;
        }
        static CreateForUI(): UIOption {
            let ret = new UIOption();
            ret.reset();
            return ret;
        }

        // static InterfaceOf(p: any): boolean {
        //     if(!p) return false;
        //     if (typeof (p) != "object") return false;
        //     let isIn = (key: string, data: UIHelper.IUIOption) => {
        //         return key in data;
        //     }
        //     let temp = new UIOption();
        //     for (const key in p) {
        //         if (!isIn(key, temp)) {
        //             return false;
        //         }
        //     }
        //     temp = null;
        //     return true;
        // }
    }
}
export default IUI;