import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimCommonFun')
export class AnimCommonFun extends Component {
    afterPlayUpgradeAnim(){
        let script:any = find("Canvas/menuLayer/TrainingLayer").getComponent("TrainingLayer");
        script.afterPlayUpgradeAnim();
    }
}

