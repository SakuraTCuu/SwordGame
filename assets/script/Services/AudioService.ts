import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";
import { AudioClip, error, log, resources } from "cc";

/**
 * 全局的声音服务
 *
 * @class AudioService
 */
@Singleton
export default class AudioService implements IService {

    public static readonly instance: AudioService

    private static readonly BGM_VOL_KEY = 'bgm_volume';
    private static readonly SFX_VOL_KEY = 'sfx_volume';

    private list = new Map<string, AudioClip>();

    private readonly audioPath = "Audios"

    // 声音大小
    private bgmVolume: number = 1.0;
    private sfxVolume: number = 1.0;

    // 背景播放id
    private bgmAudioID: number = 0;

    public async initialize() {
        await this.loadFolder();
        this.initVolume();
    }

    public async lazyInitialize() {
    }

    /**
     * 初始化音量
     */
    public initVolume() {
        const bgmVol = app.platform.getPlatform().getArchive(AudioService.BGM_VOL_KEY);
        this.bgmVolume = parseFloat(bgmVol);
        if (isNaN(this.bgmVolume)) {
            this.bgmVolume = 1;
        }

        const sfxVol = app.platform.getPlatform().getArchive(AudioService.SFX_VOL_KEY);
        this.sfxVolume = parseFloat(sfxVol);
        if (isNaN(this.sfxVolume)) {
            this.sfxVolume = 1;
        }
    }


    /**
    * 从目录加载声音
    */
    public loadFolder() {
        return new Promise<void>((resolve, reject) => {
            resources.loadDir(this.audioPath, (err, resource) => {
                for (let index = 0; index < resource.length; index++) {
                    const audio = (resource as AudioClip[])[index];
                    this.register(audio.name, audio);
                }

                this.info();

                resolve();
            });
        })
    }

    async register(
        name: string,
        audio: AudioClip
    ) {
        if (!this.list.has(name)) {
            this.list.set(name, audio);
        }
    }

    async unregister(name: string) {
        if (this.list.has(name)) {
            this.list.delete(name);
        }
    }

    /**
     * 播放背景音乐
     * @param name
    */
    public playBGM(name: string) {
        // //已经播放了背景音乐
        // if (this.bgmAudioID >= 0) {
        //     audioEngine.stop(this.bgmAudioID);
        //     this.bgmAudioID = -1;
        // }

        // if (this.list.has(name)) {
        //     const audioId = audioEngine.play(this.list.get(name), true, this.bgmVolume);
        //     this.bgmAudioID = audioId;
        //     return audioId;
        // } else {
        //     error(`播放的声音不存在!:${name}`)
        // }
    }

    /**
    * 播放音效
    * @param name
    */
    public playSFX(name: string, loop = false) {
        // if (this.sfxVolume > 0) {
        //     if (this.list.has(name)) {
        //         const audioId = cc.audioEngine.play(this.list.get(name), loop, this.sfxVolume);
        //         return audioId;
        //     } else {
        //         error(`播放的声音不存在!:${name}`)
        //     }
        // }
    }

    /**
     * 停止播放指定声音
     * @param audioId 
     */
    public stopAudio(audioId: number) {
        // cc.audioEngine.stop(audioId);
    }

    /**
    * 获取音效音量
    */
    public getSFXVolume() {
        return this.sfxVolume;
    }

    /**
     * 获取背景音乐音量
     */
    public getBGMVolume() {
        return this.bgmVolume;
    }


    /**
    * 设置音效音量
    * @param vol 
    */
    public setSFXVolume(vol: number) {
        if (this.sfxVolume != vol) {
            app.platform.getPlatform().saveArchive(AudioService.SFX_VOL_KEY, vol.toString());
            this.sfxVolume = vol;
        }
    }

    /**
     * 设置背景音乐音量
     * @param vol 
     * @param force 
     */
    public setBGMVolume(vol: number) {
        // if (this.bgmAudioID >= 0) {
        //     if (vol > 0) {
        //         cc.audioEngine.resume(this.bgmAudioID);
        //     }
        //     else {
        //         cc.audioEngine.pause(this.bgmAudioID);
        //     }
        // }
        // if (this.bgmVolume != vol) {
        //     app.platform.getPlatform().saveArchive(AudioService.BGM_VOL_KEY, vol.toString());
        //     this.bgmVolume = vol;
        //     cc.audioEngine.setVolume(this.bgmAudioID, vol);
        // }
    }

    /**
     * 暂停所有播放
    */
    public pauseAll() {
        // cc.audioEngine.pauseAll();
    }

    /**
     * 恢复所有播放
     */
    public resumeAll() {
        // cc.audioEngine.resumeAll();
    }

    /**
     * 打印信息
     * @param name 
     */
    info(name?: string) {
        if (name) {
            if (this.list.has(name)) {
                log(name + ":", this.list.get(name));
            } else {
                log(`没有${name}声音`);
            }
        } else {
            let info = "声音信息:\n"
            if (this.list.size > 0) {
                this.list.forEach(
                    (value: AudioClip, key: string, map: Map<string, AudioClip>) => {
                        info += "   " + key + "    ✔" + "\n";
                    }
                );
            } else {
                info += "   没有注册声音";
            }
            log(info)
        }
    }
}

