# Liens de l'API

## GET

### Psychologues
3 roles différents : psy_online, psy_busy, psy_offline.

Routes :
  - /users/psy_on :   psychologues disponibles (compteur) [psy]
  - /users/psy_busy : psychologues occupés (compteur) [psy]
  - /users/psy_off :  psychologues indisponibles (compteur) [psy]


### Tickets
3 statuts pour les tickets :
  - open :    le collaborateur a enclenché une conversation mais aucun psychologue n'a encore répondu.
  - pending : une conversation a débuté entre un collaborateur et un psychologue et aucun des 2 n'a cloturé le ticket.
  - closed :  une conversation a eu lieu et elle a été cloturée.

Routes:
  - /tickets?token=123 :   création / relance d'un ticket [collab (entrée)] UTILE ?
  - /tickets/123 :         tous les tickets d'un collaborateur [psy]
  - /tickets/123/pending : le ticket en cours (open / pending) d'un collaborateur [collab/psy]
  - /tickets/123/closed :  tous les tickets cloturés d'un collaborateur [psy]
  - /tickets/all :         tous les tickets [psy]
  - /tickets/closed :      tous les tickets cloturés [psy]
  - /tickets/pending :     tous les tickets non cloturés [psy]


### Messages
Routes:
  - /messages?chid=123 :         tous les messages d'un channel [psy]
  - /messages?cid=123 :          tous les messages d'un collaborateur [psy] ?
  - /messages/pending?chid=123 : tous les messages d'un channel non cloturé [collab]

## POST

  - /tickets?token=123 : création / relance d'un ticket [collab (entrée)]
