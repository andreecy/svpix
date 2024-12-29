export class Color {
	r: number;
	g: number;
	b: number;
	a: number;

	constructor(r: number, g: number, b: number, a: number) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	static fromUint32(color: number) {
		const r = (color >> 24) & 0xff;
		const g = (color >> 16) & 0xff;
		const b = (color >> 8) & 0xff;
		const a = color & 0xff;
		return new Color(r, g, b, a);
	}

	toUint32() {}
}

export class Canvas {
	width: number;
	height: number;
	imageData: ImageData;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.imageData = new ImageData(width, height);
	}

	getIndex(x: number, y: number) {
		return (y * this.width + x) * 4;
	}

	getPixel(x: number, y: number) {
		const index = this.getIndex(x, y);
		return {
			r: this.imageData.data[index + 0],
			g: this.imageData.data[index + 1],
			b: this.imageData.data[index + 2],
			a: this.imageData.data[index + 3]
		} as Color;
	}

	setPixel(x: number, y: number, color: Color) {
		const index = this.getIndex(x, y);
		this.imageData.data[index + 0] = color.r;
		this.imageData.data[index + 1] = color.g;
		this.imageData.data[index + 2] = color.b;
		this.imageData.data[index + 3] = color.a;
	}

	getImageBitmap() {
		return createImageBitmap(this.imageData);
	}
}
