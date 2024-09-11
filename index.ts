import chalk from "chalk";
import { MazeMind, sigmoid } from "./MazeCrawlerMind";

type Maze = ReturnType<typeof generateMaze>;
type MazeTile = Maze[number][number];
export type Coordinates = { x: number; y: number };

enum DIRECTIONS {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

const mazeTiles = [".", "$", "N"] as const;

function generateMaze(min: number, max: number) {
  const width = Math.round(Math.random() * (max - min) + min);
  const height = Math.round(Math.random() * (max - min) + min);

  const SCORE_MAX = 9;
  const SCORE_MIN = 1;
  //const width = Math.round(Math.max(min, Math.random() * max))

  return Array.from({ length: height }).map((_, hIndex) =>
    Array.from({ length: width }).map((_, wIndex) => {
      const tile =
        mazeTiles[Math.round(Math.random() * (mazeTiles.length - 1))];

      if (tile === "N")
        return Math.round(Math.random() * (SCORE_MAX - SCORE_MIN) + SCORE_MIN);

      return tile;
    })
  );
}

function renderMaze(maze: Maze, coordinates: Coordinates[]) {
  coordinates.forEach((coordinate) => {
    if (maze[coordinate.y] === undefined) return;

    maze[coordinate.y][coordinate.x] = chalk.bgGreen(
      maze[coordinate.y]?.[coordinate.x]
    ) as MazeTile;
  });
  maze.forEach((mazeRow) => console.log(mazeRow.join("")));
}

function convertTile(tile?: MazeTile): number {
  switch (tile) {
    case ".":
      return 0;
    case "$":
      return -1;
    case undefined:
      return -2;
    default:
      return tile;
  }
}

function move(direction: DIRECTIONS, position: Coordinates) {
  switch (direction) {
    case DIRECTIONS.UP:
      position.y -= 1;
      break;
    case DIRECTIONS.RIGHT:
      position.x += 1;
      break;
    case DIRECTIONS.DOWN:
      position.y += 1;
      break;
    case DIRECTIONS.LEFT:
      position.x -= 1;
      break;
  }
}

function runMind(
  maze: Maze,
  bestPreviousMind?: MazeMind,
  mutate?: boolean
): { points: number; mind: MazeMind; coordinates: Coordinates[] } {
  let steps = 12;
  let points = 0;

  const mind = new MazeMind(2, 2, 2, 1, bestPreviousMind?.genes);

  if (bestPreviousMind && mutate) mind.theSauce(0.75);

  const coordinates: Coordinates = {
    x: Math.round(maze.length / 2),
    y: Math.round(maze[0].length / 2),
  };
  let coordinatesHistory: Coordinates[] = [{ ...coordinates }];

  while (steps > 0) {
    if (
      coordinates.x < 0 ||
      coordinates.y < 0 ||
      coordinates.y >= maze.length ||
      coordinates.x >= maze[0].length
    ) {
      steps = 0;
      continue;
    }

    if (maze[coordinates.y][coordinates.x] !== ".") {
      if (maze[coordinates.y][coordinates.x] === "$") steps--;
      else points += maze[coordinates.y][coordinates.x] as number;
      maze[coordinates.y][coordinates.x] = ".";
    }

    const top = maze[coordinates.y - 1]?.[coordinates.x];
    const right = maze[coordinates.y]?.[coordinates.x + 1];
    const down = maze[coordinates.y + 1]?.[coordinates.x];
    const left = maze[coordinates.y]?.[coordinates.x - 1];

    const outputs = mind.feedForward([
      convertTile(top),
      convertTile(right),
      convertTile(down),
      convertTile(left),
    ]);

    const bigger = Math.max(...outputs);
    const actionIndex = outputs.findIndex((value) => value === bigger);

    move(actionIndex, coordinates);
    coordinatesHistory.push({ ...coordinates });

    steps--;
  }

  return { points, mind, coordinates: coordinatesHistory };
}

const maze = generateMaze(15, 50);

function runGeneration(generationSize: number, bestPreviousMind?: MazeMind) {
  const copyMaze = JSON.parse(JSON.stringify(maze));

  // console.log(renderMaze(copyMaze, []));

  const datas = [
    ...Array.from({ length: generationSize }).map(() =>
      runMind(JSON.parse(JSON.stringify(maze)), bestPreviousMind, true)
    ),
    runMind(JSON.parse(JSON.stringify(maze)), bestPreviousMind, false),
  ];

  const theBest = datas.find(
    (data) => data.points === Math.max(...datas.map((data) => data.points))
  );
  console.log(`Points: ${theBest?.points}\nBest Run:\n`);
  renderMaze(copyMaze, theBest?.coordinates!);

  return theBest;
}

function runSimulation(runTimes: number) {
  let bestPreviousMind: MazeMind | undefined = undefined;

  for (let generation = 0; generation < runTimes; generation++) {
    console.log(`------ ${generation} ------`);

    const bestPrevious = runGeneration(1000, bestPreviousMind);
    bestPreviousMind = bestPrevious?.mind;
  }

  console.log(bestPreviousMind?.genes);
}

runSimulation(20000);
