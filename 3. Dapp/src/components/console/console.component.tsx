import { Component } from 'react';
import ILog from '../../interfaces/iLog';
import './console.component.css';

class ConsoleComponent extends Component<{logs: ILog[]}> {

    formatDate(date: Date): string {
        return date.toISOString().replace('T', ' ').split('.')[0];
    }

    render() {

        return (
            <>
                <h2 className="console-title">{">_"}</h2>
                {this.props.logs.map((log, i) => 
                    <>
                        <label key={i} className={`console-log console-log-${log.level}`}>{`[${this.formatDate(log.date)}] ${log.message}`}</label><br/>
                    </>
                )}
            </>
        );
    }
}

export default ConsoleComponent;