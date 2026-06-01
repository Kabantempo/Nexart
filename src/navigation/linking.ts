import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [prefix, 'nexart://', 'https://nexart.app'],
  config: {
    screens: {
      Auth: {
        screens: {},
      },
      // Non-authentifié : Discover stack accessible directement
      Discover: {
        screens: {
          DiscoverHome:         'discover',
          PublicEventDetail:    'event/:eventId',
          PublicCreatorProfile: 'creator/:creatorId',
          EventMap:             'map',
        },
      },
      // Créateur : event/:eventId ouvre l'écran de détail marché
      Creator: {
        screens: {
          'Marchés': {
            screens: {
              EventList:   'events',
              EventDetail: 'event/:eventId',
            },
          },
        },
      },
      // Visiteur : partage profil/event via l'onglet Découvrir
      Visitor: {
        screens: {
          'Découvrir': {
            screens: {
              DiscoverHome:         'discover',
              PublicEventDetail:    'event/:eventId',
              PublicCreatorProfile: 'creator/:creatorId',
              EventMap:             'map',
            },
          },
        },
      },
      // Organisateur : pas de deep link spécifique pour l'instant
      Organizer: {
        screens: {},
      },
    },
  },
};

export default linking;
