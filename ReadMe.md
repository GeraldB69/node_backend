# Mise en route


## Installation
npm start

## lancement
npm start

## Déploiement
Dans index.js, passer isOnline à true


# Liens de l'API


## GET

### Psychologues
3 roles différents : psy_online, psy_busy, psy_offline.

Routes :
  - /api/users/psy_on :   psychologues disponibles (compteur) [psy]
  - /api/users/psy_busy : psychologues occupés (compteur) [psy]
  - /api/users/psy_off :  psychologues indisponibles (compteur) [psy]

### Tickets
3 statuts pour les tickets :
  - open :    le collaborateur a enclenché une conversation mais aucun psychologue n'a encore répondu.
  - pending : une conversation a débuté entre un collaborateur et un psychologue et aucun des 2 n'a cloturé le ticket.
  - closed :  une conversation a eu lieu et elle a été cloturée.

Routes:
  - /api/tickets?token=123 :   création / relance d'un ticket [collab (entrée)]
  - /api/tickets/all :         tous les tickets [psy]
  - /api/tickets/123 :         tous les tickets d'un collaborateur [psy]
  - /api/tickets/123/pending : le ticket en cours (open / pending) d'un collaborateur [collab/psy]
  - /api/tickets/123/closed :  tous les tickets cloturés d'un collaborateur [psy]
  - /api/tickets/closed :      tous les tickets cloturés [psy]
  - /api/tickets/pending :     tous les tickets non cloturés [psy]

### Messages
Routes:
  - /api/messages?chid=123 :         tous les messages d'un channel [psy]
  - /api/messages?cid=123 :          tous les messages d'un collaborateur [psy]
  - /api/messages/pending?chid=123 : tous les messages d'un channel non cloturé [collab]


## POST

### Psychologues
  - /api/users/auth/admin : accès authentifié [psy]

### Tickets
  - /api/tickets?token=123 : création / relance d'un ticket [collab (entrée)]


## PUT

### Psychologues
  - /api/users/auth/admin/123 : MAJ du statut d'un psychologue [psy]

### Tickets
  - /api/tickets/state/123 : MAJ du statut d'un ticket [psy]
