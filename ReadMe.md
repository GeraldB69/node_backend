# Liens de l'API

## GET

### Psychologues
3 roles différents : psy_online, psy_busy, psy_offline.

Routes :
/users/psy_on :   psychologues disponibles (compteur) [psy]
/users/psy_busy : psychologues occupés (compteur) [psy]
/users/psy_off :  psychologues indisponibles (compteur) [psy]


### Tickets
3 status pour les tickets :
  - open :    le collaborateur a enclenché une conversation mais aucun psychologue n'a encore répondu.
  - pending : une conversation a débuté entre un collaborateur et un psychologue et aucun des 2 n'a cloturé le ticket.
  - closed :  une conversation a eu lieu et elle a été coturée.

Routes:
/tickets?token= :  lien du collaborateur pour ouvrir / poursuivre un ticket [collab]
/tickets/all :     tous les tickets [psy]
/tickets/pending : tous les tickets non cloturés [psy]


## POST

/tickets?token=123 : création / relance d'un ticket
