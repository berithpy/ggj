import generate from 'generate-maze'
import Door from './door'
import Item from './item'
var randomObjProp = require('random-obj-prop')


var TILE_TYPE = {
  CLEAR: 0,
  WALL: 1,
};

var DOOR_TYPE_UD = {
  ONE: 2,
  TWO: 3,
  THREE: 4,
}

// This is automatically populated based on DOOR_TYPE_UD
var DOOR_TYPE_LR = {};
for (let type in DOOR_TYPE_UD) {
  DOOR_TYPE_LR[type] = DOOR_TYPE_UD[type] + Object.keys(DOOR_TYPE_UD).length;
}

/**
 * The door orientation is used in functions that need to return a door in a 
 * certain orientation.
 */
var DOOR_ORIENTATION = {
  UD: 0,
  LR: 1,
}

var ITEM_TYPE = {
  ONE: 10,
  TWO: 11,
  THREE: 12,
}

/**
 * Generates a random type of door. Door types are defined in DOORTYPE.
 * @param {DOOR_ORIENTATION} orientation Sets the door orientation type.
 */
function generateDoor(orientation) {
  var doors;
  if (orientation === DOOR_ORIENTATION.UD)
    doors = DOOR_TYPE_UD;
  else if (orientation === DOOR_ORIENTATION.LR)
    doors = DOOR_TYPE_LR;
  else
    throw 'Attempted to generate door with invalid orientation.'

  return randomObjProp(doors); 
}

/**
 * Generates a random type of item. Item types are defined in ITEM_TYPE.
 */
function generateItem() {
  return randomObjProp(ITEM_TYPE); 
}

/**
 * Generates an item 
 * @param {Number} x Vertical coordinate.
 * @param {Number} y Horizontal coordinate.
 * @param {Phaser.Group} itemGroup Item group.
 * @param {ITEM_TYPE} [ITEM_TYPE] Item type to generate. If this paramater is 
 * not defined a random type of item will be generated.
 */
function itemFactory(x, y, itemGroup, itemType) {
  itemType = itemType || generateItem();
}

/**
 * Generates a maze and populates it doors and objects.
 * @param {Array[Array]} tilemapData Tilemap data. This group will hold the 
 * generated maze tiles.
 * @param {Number} horizontalOffset Tilemap horizontal offset from origin in 
 * which to place the generated maze.
 * @param {Number} verticalOffset Tilemap vertical offset from origin in which 
 * to place the generated maze.
 * @param {Number} width Width of the maze. MUST be odd.
 * @param {Number} height Height of the maze. MUST be odd.
 * @param {Phaser.Group} doorGroup Door group. This group will hold the 
 * generated doors.
 * @param {Phaser.Group} itemGroup Item group. This group will hold all 
 * generated items.
 * @param {Number} itemChance Number between 0 and 1 with the chance to create 
 * a door. A higher number represents a higher chance to have a door.
 * @param {Number} itemChance Number between 0 and 1 with the chance to create 
 * an item. A higher number represents a higher chance to create an item. Items 
 * are created after doors, so a higher door chance will reduce the number of 
 * generated items.
 * @returns {Array[Array]} Matrix of the specified width and height containing 
 * TILE_TYPE entries.
 */
function generateMaze(tilemapData,
                      horizontalOffset, verticalOffset,
                      width, height,
                      doorGroup, itemGroup,
                      doorChance, itemChance) {
  if (width % 2 === 0 || height % 2 === 0)
    throw 'Cannot generate maze with even dimensions. Dimensions MUST be odd!';

  // This generator outputs a matrix of objects with the walls for each 
  // coordinate, generated by the Eller algorithm. 
  // We will transform the Eller matrix to a matrix of TILE_TYPE entries. 
  // Eller matrixes require less elements to represent a maze, so we need 
  // to lower the number of coordinates required from the generator.
  let gen = generate((width + 1) / 2, (height + 1) / 2);

  // Update width and height to account for offsets
  height = height + verticalOffset;
  width = width + horizontalOffset;

  // Convert the Eller matrix to a TILE_TYPE matrix.
  // No borders are included in the generated TILE_TYPE matrix, they are 
  // expected to be guaranteed by the game
  for (let x=verticalOffset; x < height; x += 2) {
    for (let y=horizontalOffset; y < width; y += 2) {
      let piece = gen[(x-verticalOffset)/2][(y-horizontalOffset)/2];
      // Set the current position to CLEAR
      tilemapData[x][y] = TILE_TYPE.CLEAR;
      // Set the corner down right to wall
      if (x < height - 1 && y < width - 1)
        tilemapData[x+1][y+1] = TILE_TYPE.WALL;
      // Set the right and bottom walls
      if (x < height - 1)
        tilemapData[x+1][y] = piece.bottom ? TILE_TYPE.WALL : TILE_TYPE.CLEAR;
      if (y < width - 1)
        tilemapData[x][y+1] = piece.right ? TILE_TYPE.WALL : TILE_TYPE.CLEAR;
    }
  } 

  // Set maze doors:
  // * Doors must be place on coordinates that have either both left and right 
  //   or up and down walled.
  // * Doors cannot be next to other doors.
  if (!doorChance && doorChance !== 0)
    doorChance = 0.5;
  for (let x=verticalOffset; x < height; x += 1) {
    for (let y=horizontalOffset; y < width; y += 1) {
      // If placement roll does not succeed skip placement
      if (Math.random() > doorChance || tilemapData[x][y] !== TILE_TYPE.CLEAR) 
        continue

      // Wall coordinate flags
      let wall_up = x > 0 ? tilemapData[x-1][y] === TILE_TYPE.WALL : true;
      let wall_down = x < height-1 ? tilemapData[x+1][y] === TILE_TYPE.WALL : true;
      let wall_left = y > 0 ? tilemapData[x][y-1] === TILE_TYPE.WALL : true;
      let wall_right = y < width-1 ? tilemapData[x][y+1] === TILE_TYPE.WALL : true;
      // Clear coordinate flags
      let clear_up = x > 0 ? tilemapData[x-1][y] === TILE_TYPE.CLEAR : false;
      let clear_down = x < height-1 ? tilemapData[x+1][y] === TILE_TYPE.CLEAR : false;
      let clear_left = y > 0 ? tilemapData[x][y-1] === TILE_TYPE.CLEAR : false;
      let clear_right = y < width-1 ? tilemapData[x][y+1] === TILE_TYPE.CLEAR : false;

      // Place door
      if (wall_up && wall_down && clear_left && clear_right) 
        tilemapData[x][y] = generateDoor(DOOR_ORIENTATION.UD);
      if (wall_left && wall_right && clear_up && clear_down)
        tilemapData[x][y] = generateDoor(DOOR_ORIENTATION.LR);
    }
  }

  // Set maze items.
  if (!itemChance && itemChance !== 0)
    itemChance = 0.2;
  for (let x=verticalOffset; x < height; x += 1) {
    for (let y=horizontalOffset; y < width; y += 1) {
      // If placement roll does not succeed skip placement
      if (Math.random() > itemChance || tilemapData[x][y] !== TILE_TYPE.CLEAR) 
        continue

      tilemapData[x][y] = generateItem();
    }
  }

  return tilemapData;
};

module.exports = {
  TILE_TYPE,
  generateMaze,
}
