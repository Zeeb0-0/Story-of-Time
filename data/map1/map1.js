import { collision1 } from './collision1.js'
import { floorCollisions1, platformCollisions1 } from './layers.js'

export const map1 = {
  player: {
    position: {
      x: 70,
      y: 250
    }
  },
  collisionBlocks: collision1,
  platformCollisions: platformCollisions1,
  floorCollisions: floorCollisions1,
  // any other map-specific data
}