import LogLevel from "../enumerations/logLevel";

interface ILog {
    level: LogLevel;
    message: string;
}

export default ILog;