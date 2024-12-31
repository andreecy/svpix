import { Color } from './color';

export class Canvas {
	width: number;
	height: number;
	imageData: ImageData;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.imageData = new ImageData(width, height);

		this.clearPixel();
	}

	setImageData(imageData: ImageData) {
		this.imageData = imageData;
	}

	clearPixel() {
		this.imageData.data.fill(0);
	}

	getIndex(x: number, y: number) {
		return (y * this.width + x) * 4;
	}

	getPixel(x: number, y: number) {
		const index = this.getIndex(x, y);
		return new Color(
			this.imageData.data[index + 0],
			this.imageData.data[index + 1],
			this.imageData.data[index + 2],
			this.imageData.data[index + 3]
		);
	}

	setPixel(x: number, y: number, color: Color) {
		const index = this.getIndex(x, y);
		this.imageData.data[index + 0] = color.r;
		this.imageData.data[index + 1] = color.g;
		this.imageData.data[index + 2] = color.b;
		this.imageData.data[index + 3] = color.a;
	}

	deletePixel(x: number, y: number) {
		const index = this.getIndex(x, y);
		this.imageData.data[index + 0] = 0;
		this.imageData.data[index + 1] = 0;
		this.imageData.data[index + 2] = 0;
		this.imageData.data[index + 3] = 0;
	}

	getImageBitmap() {
		return createImageBitmap(this.imageData);
	}
}
