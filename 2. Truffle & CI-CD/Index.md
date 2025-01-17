# Tests unitaires du contrat "Voting"

## Contenu des tests

Le projet courant contient 59 tests pour couvrir le contrat `Voting.sol`\
Ces tests permettent :
- de valider le comportement nominal attendu des modifiers et des fonctions
- de valider l'absence de comportement atypique
- de valider des workflows complets au travers de tests d'intégration
___________________________________________________________________________________________________________________________________________
## Prérequis

Afin de pouvoir correctement exécuter le projet sur votre poste, vous devez d'abord démarrer une blockchain Ethereum locale.
Le projet est pré-configuré pour ganache, si cela n'est pas votre cas veuillez modifier le fichier `truffle-config.js`
___________________________________________________________________________________________________________________________________________
## Utilisation

1. `npm install`
2. `npm run compile`
3. `npm run migrate`
4. `npm run test-development`

___________________________________________________________________________________________________________________________________________
## Consommation théorique des méthodes en gaz

Solc version: 0-8-17+commit-8df45f5f   |  Optimizer enabled: false  |  Runs: 200  |  Block limit: 6718946 gas
----------------------------------------|----------------------------|-------------|-----------------------------
**Methods**
||||||
Contract  |  Method                     |  Min         |  Max        |  Avg        |  # calls     |  eur (avg)  
||||||
Voting    |  addProposal                |       59184  |      59196  |      59185  |          36  |          -  
||||||
Voting    |  addVoter                   |           -  |          -  |      50220  |          59  |          -  
||||||
Voting    |  endProposalsRegistering    |           -  |          -  |      30599  |          13  |          -  
||||||
Voting    |  endVotingSession           |           -  |          -  |      30533  |           4  |          -  
||||||
Voting    |  setVote                    |       41001  |      78013  |      62421  |          25  |          -  
||||||
Voting    |  startProposalsRegistering  |           -  |          -  |      95032  |          24  |          -  
||||||
Voting    |  startVotingSession         |           -  |          -  |      30554  |          14  |          -  
||||||
Voting    |  tallyVotes                 |       37849  |      66469  |      48427  |           6  |          -  
||||||
Deployments                             |                                          |  % of limit  |             
||||||
Voting                                  |           -  |          -  |    2077414  |      30-9 %  |          -  
||||||
