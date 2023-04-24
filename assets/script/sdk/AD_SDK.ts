import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
const { ccclass, property } = _decorator;

@ccclass('AD_SDK')
export class AD_SDK extends Component {
    onDestroy() {
        em.remove("createPlayADEvent");
        em.remove("directPlayAD");
    }
    onLoad() {
        em.add("createPlayADEvent", this.createPlayADEvent.bind(this));
        em.add("directPlayAD", this.directPlayAD.bind(this));

    }
    //创建播放广告事件
    createPlayADEvent(btnNode, string) {
        glf.createButton(this.node, btnNode, "AD_SDK", "onBtnShowADs" + string);
    }
    onBtnShowADsGameMonetize() {
        if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
            sdk.showBanner();
        }
    }
    //直接播放广告
    directPlayAD(string) {
        this["onBtnShowADs" + string]();
    }
}

