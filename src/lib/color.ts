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

	toUint32() {
		return (this.a << 24) | (this.r << 16) | (this.g << 8) | this.b;
	}
}
