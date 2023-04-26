import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('helpLayer')
export class helpLayer extends Component {
    onBtnUnlockAllStages(){
        ggd.stageProgress = 80;
        app.storage.savingGlobalDataToTempData();
    }
    // 解锁下一关
    onBtnUnlockNextStages(){
        if(ggd.stageProgress>=80) return;
        ggd.stageProgress++;
        app.storage.savingGlobalDataToTempData();
    }
    onBtnOpenHelpLayer(){
        this.node.active = true;
    }
    onBtnCloseHelpLayer(){
        this.node.active = false;
    }
    onBtnOpenDamageImmunity(){  
        em.dispatch("usingHeroControlFun","openDamageImmunity");
    }
}

