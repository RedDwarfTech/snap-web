const ColorUtil = {
    compareColor: (hexColor1: string, hexColor2: string): boolean => {
        const parseHex = (hex: string): [number, number, number] => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        }
        const [r1, g1, b1] = parseHex(hexColor1);
        const [r2, g2, b2] = parseHex(hexColor2);
        return (r1 === r2 && g1 === g2 && b1 === b2);
    }
};

export default ColorUtil;
