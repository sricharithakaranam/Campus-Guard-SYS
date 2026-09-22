import { Human } from "@vladmandic/human";

const humanConfig = {
  backend: "webgl",

  modelBasePath:
    "https://vladmandic.github.io/human-models/models/",

  filter: {
    enabled: true,
    equalization: true,
    flip: false,
  },

  face: {
    enabled: true,

    detector: {
      enabled: true,
      rotation: true,
      maxDetected: 1,
    },

    mesh: {
      enabled: true,
    },

    iris: {
      enabled: false,
    },

    description: {
      enabled: true,
    },

    emotion: {
      enabled: false,
    },

    antispoof: {
      enabled: false,
    },

    liveness: {
      enabled: false,
    },
  },

  body: {
    enabled: false,
  },

  hand: {
    enabled: false,
  },

  object: {
    enabled: false,
  },

  gesture: {
    enabled: false,
  },

  segmentation: {
    enabled: false,
  },
};

export const human = new Human(humanConfig);