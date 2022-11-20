import { Component, Fragment } from 'react';
import ILog from '../../models/ILog';
import './console.component.css';

const maxLength: number = 80;

class ConsoleComponent extends Component<{logs: ILog[]}> {

    formatDate(date: Date): string {
        return date.toISOString().replace('T', ' ').split('.')[0];
    }

    formatShortLog(message: string): string {

        let shortMessage: string = message;

        if (shortMessage.length > maxLength) {
            shortMessage = `${shortMessage.slice(0, maxLength)}...`;
        }

        return shortMessage;
    }

    render() {

        return (
            <>
                <h2 className="console-title">{">_"}</h2>
                {this.props.logs.map((log, i) => 
                    <Fragment key={i}>
                        <label className={`console-log console-log-${log.level}`} title={log.message}>{`[${this.formatDate(log.date)}] ${this.formatShortLog(log.message)}`}</label><br/>
                    </Fragment>
                )}
            </>
        );
    }
}

export default ConsoleComponent;