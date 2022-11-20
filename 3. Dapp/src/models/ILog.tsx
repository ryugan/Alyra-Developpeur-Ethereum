import LogLevel from "../enumerations/logLevel";

interface ILog {
    level: LogLevel;
    date: Date;
    message: string;
}

export default ILog;