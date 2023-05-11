import { platform } from 'os';

const toFileName = (file) => file.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
const getDirName = (type) => {
    let dir = `./downloads/CornBox/${type}`;
    if (platform() === 'android') dir = `/storage/emulated/0/CornBox/${type}`;
    return dir;
};
export { toFileName, getDirName };
