import { Component } from 'react';
import IProposal from '../../models/IProposal';
import './proposals.component.css';

class ProposalsComponent extends Component<{proposals: IProposal[]}> {

    format(proposal: IProposal): string {
        return `[${proposal.id}] ${proposal.description} (${proposal.vote} vote${proposal.vote > 0 ? 's' : ''})`;
    }

    sort(prop1: IProposal, prop2: IProposal) {
        if (prop1.id > prop2.id) {
            return 1;
        }
        if (prop1.id > prop2.id) {
            return -1;
        }
        return 0;
    }

    render() {
        const proposals = this.props.proposals.filter(p => p.id > 0).sort(this.sort);

        return (
            <>
                <h2 className="proposals-title">
                    Proposals <label className="proposals-sub-title">({proposals.length})</label>
                </h2>
                {proposals.map((prop) => 
                    <>
                        <label key={prop.id} title={prop.description}>{this.format(prop)}</label><br/>
                    </>
                )}
            </>
        );
    }
}

export default ProposalsComponent;