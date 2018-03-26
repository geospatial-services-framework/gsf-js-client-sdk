
declare namespace GSF {

        export interface API {
            client(clientOptions: ClientOptions): Client;
        }
        export interface ClientOptions {
            address: string;
            port?: string;
            APIRoot?: string;
            protocol?: string;
        }
        export interface Client {
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
            inputParameters: object;
            jobOptions?: JobOptions;
        }
        export interface JobOptions {
            route?: string;
        }
        export interface ProgressCallback {
            (info: JobProgressInfo) : void;
        }
        export interface JobProgressInfo {
            jobId: number;
            progress: number;
            message?: string;
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
            serviceName: string;
            taskName: string;
            jobOptions?: JobOptions;
            inputParameters: Object;
            jobId?: number;
            jobProgress?: number;
            jobMessage?: string;
            jobStatus: string;
            jobResults?: Object;
            jobSubmitted?: string;
            jobStart?: string;
            jobEnd?: string;
            jobError?: string;
            nodeInfo?: NodeInfo;
        }

        export interface NodeInfo {
            nodeAddress: string;
            nodePort: number;
            workerID: number;
        }

        export interface JobResults {
            [key: string]: any;
        }
        export interface ServiceInfo {
            name: string;
            description?: string;
        }
        export interface TaskInfo {
            taskName: string;
            serviceName: string;
            displayName?: string;
            description?: string;
            inputParameters: InputParameter[];
            outputParameters: OutputParameter[];
        }
        export interface InputParameter {
            displayName?: string;
            description?: string;
            choiceList?: string[];
            type: string;
            default?: any;
            name: string;
            required: boolean;
        }
        export interface OutputParameter {
            displayName?: string;
            description?: string;
            type: string;
            name: string;
            required: boolean;
        }

    }

    declare var GSF: GSF.API;
    export = GSF;