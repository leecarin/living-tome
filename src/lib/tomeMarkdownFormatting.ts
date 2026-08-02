export function splitPassageIntoBlocks(passage?: string): string[] {
    return passage ? passage.split(/\n\n/) : [];
}
