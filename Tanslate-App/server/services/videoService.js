import path from 'path';
import fs from 'fs/promises';

export const deleteFiles = async (directoryPath) => {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
        await fs.unlink(path.join(directoryPath, file));
    }
};

export const checkVideoExists = async (directoryPath) => {
    const pathToFile = path.join(directoryPath, 'output_video.mp4');
    try {
        await fs.access(pathToFile);
        return true;
    } catch {
        return false;
    }
};
