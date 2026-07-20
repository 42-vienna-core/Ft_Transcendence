import { AiBotService } from './ai.service';
import { Food, GameState, Snake } from 'src/game/interfaces/game-state';

const TEST_TIMEOUT_MS = 200;

describe('AiBotService', () => {
	let service: AiBotService;

	beforeEach(() => {
		service = new AiBotService();
	});

	function createSnake(
		id: number,
		body: { x: number; y: number }[],
		direction: Snake['direction'] = 'RIGHT',
	): Snake {
		return {
			id,
			body,
			direction,
			newDirection: null,
			newPosition: null,
			willGrow: false,
			alive: true,
			score: 0,
			color: 'green',
		};
	}

	function createFood(x: number, y: number, eaten = false): Food {
		return {
			position: { x, y },
			eaten,
		};
	}

	function createGame(
		snakes: Snake[],
		food: Food[],
		gridWidth = 5,
		gridHeight = 5,
	): GameState {
		return {
			roomId: 'room-1',
			snakes,
			food,
			status: 'running',
			tick: 0,
			gridWidth,
			gridHeight,
			winnerId: null,
		};
	}

	it('creates a map with the requested dimensions', () => {
		const game = createGame([], [], 7, 4);

		const map = service.createMap(game);

		expect(map).toHaveLength(7);
		expect(map[0]).toHaveLength(4);
	}, TEST_TIMEOUT_MS);

	it('creates a non-square map with the requested dimensions', () => {
		const game = createGame([], [], 8, 3);

		const map = service.createMap(game);

		expect(map).toHaveLength(8);
		expect(map[0]).toHaveLength(3);
	}, TEST_TIMEOUT_MS);

	it('marks snake cells and food on the map', () => {
		const snake = createSnake(1, [{ x: 1, y: 1 }]);
		const game = createGame([snake], [createFood(3, 2)]);

		const map = service.createMap(game);

		expect(map[1][1]).toBe('1');
		expect(map[3][2]).toBe('F');
		expect(map[0][0]).toBe('0');
	}, TEST_TIMEOUT_MS);

	it('marks every segment from multiple snakes', () => {
		const snakeA = createSnake(1, [
			{ x: 1, y: 1 },
			{ x: 1, y: 2 },
		]);
		const snakeB = createSnake(2, [
			{ x: 3, y: 0 },
			{ x: 4, y: 0 },
		]);
		const game = createGame([snakeA, snakeB], [createFood(2, 4)]);

		const map = service.createMap(game);

		expect(map[1][1]).toBe('1');
		expect(map[1][2]).toBe('1');
		expect(map[3][0]).toBe('1');
		expect(map[4][0]).toBe('1');
		expect(map[2][4]).toBe('F');
	}, TEST_TIMEOUT_MS);

	it('ignores eaten food when creating the map', () => {
		const snake = createSnake(1, [{ x: 1, y: 1 }]);
		const game = createGame([snake], [createFood(2, 2, true)]);

		const map = service.createMap(game);

		expect(map[2][2]).toBe('0');
	}, TEST_TIMEOUT_MS);

	it('marks multiple uneaten foods on a larger map', () => {
		const snake = createSnake(1, [{ x: 0, y: 0 }]);
		const game = createGame(
			[snake],
			[createFood(2, 1), createFood(5, 3), createFood(6, 0)],
			8,
			4,
		);

		const map = service.createMap(game);

		expect(map[2][1]).toBe('F');
		expect(map[5][3]).toBe('F');
		expect(map[6][0]).toBe('F');
	}, TEST_TIMEOUT_MS);

	it('moves right when food is directly to the right', () => {
		const snake = createSnake(1, [{ x: 1, y: 1 }]);
		const game = createGame([snake], [createFood(2, 1)]);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('RIGHT');
	}, TEST_TIMEOUT_MS);

	it('moves left when food is directly to the left', () => {
		const snake = createSnake(1, [{ x: 2, y: 1 }]);
		const game = createGame([snake], [createFood(1, 1)]);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('LEFT');
	}, TEST_TIMEOUT_MS);

	it('moves up when food is directly above', () => {
		const snake = createSnake(1, [{ x: 2, y: 2 }]);
		const game = createGame([snake], [createFood(2, 1)]);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('UP');
	}, TEST_TIMEOUT_MS);

	it('moves down when food is directly below', () => {
		const snake = createSnake(1, [{ x: 2, y: 1 }]);
		const game = createGame([snake], [createFood(2, 2)]);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('DOWN');
	}, TEST_TIMEOUT_MS);

	it('chooses the first step of a longer horizontal path on a non-square map', () => {
		const snake = createSnake(1, [{ x: 0, y: 2 }]);
		const game = createGame([snake], [createFood(6, 2)], 7, 4);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('RIGHT');
	}, TEST_TIMEOUT_MS);

	it('chooses the first step of a longer vertical path on a non-square map', () => {
		const snake = createSnake(1, [{ x: 3, y: 0 }]);
		const game = createGame([snake], [createFood(3, 4)], 6, 5);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('DOWN');
	}, TEST_TIMEOUT_MS);

	it('chooses a valid fallback move when no food exists', () => {
		const snake = createSnake(1, [{ x: 2, y: 2 }]);
		const game = createGame([snake], []);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(['LEFT', 'RIGHT', 'UP', 'DOWN']).toContain(direction);
	}, TEST_TIMEOUT_MS);

	it('chooses a valid in-bounds fallback move from the corner', () => {
		const snake = createSnake(1, [{ x: 0, y: 0 }]);
		const game = createGame([snake], []);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(['RIGHT', 'DOWN']).toContain(direction);
	}, TEST_TIMEOUT_MS);

	it('does not throw when food is farther away than one step', () => {
		const snake = createSnake(1, [{ x: 1, y: 1 }]);
		const game = createGame([snake], [createFood(4, 4)]);

		const map = service.createMap(game);

		expect(() => service.newBotDirection(snake, map)).not.toThrow();
	}, TEST_TIMEOUT_MS);

	it('prefers the closer reachable food among multiple foods on the same row', () => {
		const snake = createSnake(1, [{ x: 1, y: 1 }]);
		const game = createGame([snake], [createFood(2, 1), createFood(5, 1)], 7, 4);

		const map = service.createMap(game);
		const direction = service.newBotDirection(snake, map);

		expect(direction).toBe('RIGHT');
	}, TEST_TIMEOUT_MS);

	it('moves toward the only reachable food when another food is blocked by a snake obstacle', () => {
		const botSnake = createSnake(1, [{ x: 1, y: 1 }]);
		const obstacleSnake = createSnake(2, [
			{ x: 2, y: 1 },
			{ x: 2, y: 0 },
			{ x: 2, y: 2 },
		]);
		const game = createGame(
			[botSnake, obstacleSnake],
			[createFood(3, 1), createFood(1, 3)],
			5,
			5,
		);

		const map = service.createMap(game);
		const direction = service.newBotDirection(botSnake, map);

		expect(direction).toBe('DOWN');
	}, TEST_TIMEOUT_MS);

	it('avoids moving into an obstacle snake directly in front of the head', () => {
		const botSnake = createSnake(1, [{ x: 1, y: 1 }]);
		const obstacleSnake = createSnake(2, [{ x: 2, y: 1 }]);
		const game = createGame([botSnake, obstacleSnake], [createFood(4, 1)], 6, 4);

		const map = service.createMap(game);
		const direction = service.newBotDirection(botSnake, map);

		expect(direction).not.toBe('RIGHT');
	}, TEST_TIMEOUT_MS);

	it('finds a path around a vertical wall with one gap', () => {
		const botSnake = createSnake(1, [{ x: 1, y: 2 }]);
		const obstacleSnake = createSnake(2, [
			{ x: 2, y: 0 },
			{ x: 2, y: 1 },
			{ x: 2, y: 3 },
			{ x: 2, y: 4 },
		]);
		const game = createGame([botSnake, obstacleSnake], [createFood(4, 2)], 6, 5);

		const map = service.createMap(game);
		const direction = service.newBotDirection(botSnake, map);

		expect(['RIGHT']).toContain(direction);
	}, TEST_TIMEOUT_MS);

	it('returns a legal move when almost all neighbors are blocked by snakes', () => {
		const botSnake = createSnake(1, [{ x: 1, y: 1 }]);
		const obstacleSnake = createSnake(2, [
			{ x: 0, y: 1 },
			{ x: 1, y: 0 },
			{ x: 2, y: 1 },
		]);
		const game = createGame([botSnake, obstacleSnake], [], 4, 4);

		const map = service.createMap(game);
		const direction = service.newBotDirection(botSnake, map);

		expect(direction).toBe('DOWN');
	}, TEST_TIMEOUT_MS);
});
