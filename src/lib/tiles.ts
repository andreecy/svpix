import { Canvas } from './canvas';

export class Tiles extends Canvas {
	// define singleton here
	private static _instance: Tiles;

	public static get instance() {
		if (!Tiles._instance) {
			Tiles._instance = new Tiles(128, 128);
		}
		return Tiles._instance;
	}
}
