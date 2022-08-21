import {IGuard} from './utilities/common-utils';

const hashToVideoNameTypeGuard: `hashToVideoNameTypeGuard` = `hashToVideoNameTypeGuard`;

interface IVideoName extends IGuard<typeof hashToVideoNameTypeGuard> {
  videoName: string;
}
