/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-09 17:52:38
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-26 15:35:14
 * @FilePath: \copy9train\assets\script\system\AudioManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, game, AudioSource, AudioClip, input, Input, director } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property(AudioClip)
    mainBGM: AudioClip;
    @property(AudioSource)
    bgmPlayer;
    @property(AudioSource)
    effectPlayer;

    onDestroy() {
        em.remove("switchMainBgm");
        em.remove("playOneShot");
        em.remove("muteAudio");
        em.remove("resumeAudio");
    }
    onLoad() {
        em.add("switchMainBgm", this.switchMainBgm.bind(this));
        em.add("playOneShot", this.playOneShot.bind(this));
        em.add("muteAudio", this.muteAudio.bind(this));
        em.add("resumeAudio", this.resumeAudio.bind(this));
        director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点
    }

    start() {
        this.switchMainBgm("/audio/music/刀剑如梦");
    }
    // 切换bgm
    switchMainBgm(url){
        this.bgmPlayer.stop();
        em.dispatch("loadTheDirResources", url, (clip) => {
            this.bgmPlayer.clip = clip;
            this.bgmPlayer.play();
        });
    }
    //播放音效
    playOneShot(url) {
        em.dispatch("loadTheDirResources", "/audio/effect/"+url, (clip) => {
            this.effectPlayer.playOneShot(clip);
        });
    }
    //静音
    muteAudio(){
        this.effectPlayer.mute = false;
        this.bgmPlayer.mute = false;
    }
    //恢复音效
    resumeAudio(){
        this.effectPlayer.mute = true;
        this.bgmPlayer.mute = true;
    }
}

