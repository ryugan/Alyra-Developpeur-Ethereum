# Version Dapp du contrat "Voting"

## Contenu de la Dapp

Le projet courant contient le contrat `Voting.sol`\
Le contrat a été commenté et des protections ont été ajoutées contre des failles connues
De plus le contrat est maintenant manipulable via une site Web
___________________________________________________________________________________________________________________________________________
## Prérequis

Ajouter un fichier `.env` à la racine du projet.
Veuillez y ajouter ensuite la clé privée de votre compte Metamask dans un paramètre `PRIVATE_KEY`
___________________________________________________________________________________________________________________________________________
## Utilisation

1. `npm install`
2. `npm run node`
3. `npm run compile`
4. `npm run deploy-dev`
5. Copier l'adresse du contrat dans un paramètre `REACT_APP_CONTRACT_ADDRESS` dans le fichier `.env`
6. `npm run start`