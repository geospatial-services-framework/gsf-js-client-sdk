
declare namespace GSF {
    export interface ServerArgs {
        address: string;
        port: string;
    }
    export interface API {
        server(serverArgs: ServerArgs): Server;
    }
    export interface Server {
        service(serviceName: string): Service;
        services(): Promise<Array<Service>>;
    }
    export interface Service {
        task(taskName: string): Task;
        tasks(): Promise<Array<Task>>;
    }
    export interface Task {
        name: string;
        info(): Promise<TaskInfo>;
        submit(options?: SubmitOptions, 
            progressCallback?: ProgressCallback, 
            startedCallback?: StartedCallback): Promise<Job>;
        submitAndWait(options: SubmitOptions, 
            progressCallback?: ProgressCallback, 
            startedCallback?: StartedCallback): Promise<any>;
    }
    export interface SubmitOptions {
        parameters: object;
        route?: string;
    }
    interface ProgressCallback {
        (info: JobProgressInfo) : void;
    }
    interface JobProgressInfo {
        
    }
    interface StartedCallback {
        (info: JobStartedInfo) : Promise<Job>;
    }
    interface JobStartedInfo {
        
    }
    interface TaskInfo {
        name: string;
        displayName: string;
        description: string;
    }
    interface Job {
    }
}
    
declare var GSF: GSF.API;
export = GSF;