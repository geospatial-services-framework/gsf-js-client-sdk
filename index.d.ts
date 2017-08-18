
declare namespace GSF {

        export interface API {
            server(serverArgs: ServerArgs): Server;
        }
        export interface ServerArgs {
            address: string;
            port?: string;
            APIRoot?: string;
            protocol?: string;
        }
        export interface Server {
            APIRoot: string;
            URL: string;
            address: string;
            port: number;
            protocol: string;
            rootURL: string;
            service(serviceName: string): Service;
            services(): Promise<Array<Service>>;
            job(jobId: number,
                progressCallback?: ProgressCallback,
                startedCallback?: StartedCallback): Job;
            jobs(jobListOptions: JobListOptions): Promise<Array<Job>>
        }
        export interface Service {
            name: string;
            info(): Promise<ServiceInfo>;
            task(taskName: string): Task;
            tasks(): Promise<Array<Task>>;
            taskInfoList(): Promise<Array<TaskInfo>>;
        }
        export interface Task {
            name: string;
            service: Service;
            info(): Promise<TaskInfo>;
            submit(options: SubmitOptions,
                progressCallback?: ProgressCallback,
                startedCallback?: StartedCallback): Promise<Job>;
            submitAndWait(options: SubmitOptions,
                progressCallback?: ProgressCallback,
                startedCallback?: StartedCallback): Promise<any>;
        }
        export interface Job {
            jobId: number;
            cancel(force: boolean): Promise<boolean>;
            info(): Promise<JobInfo>;
            wait(): Promise<JobResults>;
            on(event: string, callback: (p?: any) => void ): void;
            removeListener(eventName: any, listener: (p?: any) => void): void;
            removeAllListeners(): void;
        }

        export interface SubmitOptions {
            parameters: object;
            route?: string;
        }
        export interface ProgressCallback {
            (info: JobProgressInfo) : void;
        }
        export interface JobProgressInfo {
            jobId: number;
            progress: number;
            message: string;
        }
        export interface StartedCallback {
            (info: JobStartedInfo) : void;
        }
        export interface JobStartedInfo {
            jobId: number;
        }
        export interface JobListOptions {
            offset?: number;
            limit?: number;
            reverse?: boolean;
            status?: string;
        }
        export interface JobInfo {
            jobId: string;
            jobStatus: string;
            jobStatusURL: string;
            jobProgress: number;
            jobProgressMessage: string;
            jobRoute: string;
            taskName: string;
            serviceName: string;
            jobErrorMessage: string;
            inputs: object;
            messages: Array<object>;
            results: object;
        }
        export interface JobResults {
            [key: string]: any;
        }
        export interface ServiceInfo {
            name: string;
            description: string;
            tasks: Array<string>;
        }
        export interface TaskInfo {
            name: string;
            displayName?: string;
            description?: string;
            parameters: TaskParameters;
        }
        export interface TaskParameters {
            [key: string]: TaskParameter;
        }
        export interface TaskParameter {
            displayName?: string;
            description?: string;
            choiceList?: string[];
            direction: string;
            dataType: string;
            defaultValue?: any;
            name: string;
            parameterType: string;
        }

    }

    declare var GSF: GSF.API;
    export = GSF;