import IService from "../Interfaces/IService";
import Singleton from "../Decorators/Singleton";
import ICommand from "../Interfaces/ICommand";
import TimerService from "./TimerService";

@Singleton
export default class CommandService implements IService {
    public static readonly instance: CommandService;


    public async initialize() {
    }

    public async lazyInitialize() {
    }




    /**
     * 执行命令
     * @param cmd 
     * @param args 
     */
    public exec(cmd: typeof ICommand, ...args: any[]) {
        (new (cmd as any)()).exec(...args);
    }

    /**
     * 下一帧执行命令
     *
     * @template T
     * @param {T} cmd
     * @param {...any[]} args
     * @memberof CommandService
     */
    public execNextFrame(cmd: typeof ICommand, ...args: any[]) {
        TimerService.instance.runNextFrame(() => {
            (new (cmd as any)()).exec(...args);
        })
    }

    /**
     * 异步执行命令
     * 
     * @param cmd 
     * @param args 
     */
    public execAsync(cmd: typeof ICommand, ...args: any[]) {
        new Promise<void>((resolve, reject) => {
            (new (cmd as any)()).exec(...args);
            resolve();
        })
    }

}
