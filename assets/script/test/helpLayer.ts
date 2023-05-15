import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
import { Constant } from '../Common/Constant';

const { ccclass, property } = _decorator;

@ccclass('helpLayer')
export class helpLayer extends Component {
    onBtnUnlockAllStages(){
        Constant.GlobalGameData.stageProgress = 80;
        app.storage.savingGlobalDataToTempData();
    }
    // 解锁下一关
    onBtnUnlockNextStages(){
        if(Constant.GlobalGameData.stageProgress>=80) return;
        Constant.GlobalGameData.stageProgress++;
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

