import {IGuard} from './utilities/common-utils';

export const videoNameTypeGuard: `hashToVideoNameTypeGuard` = `hashToVideoNameTypeGuard`;

export interface IVideoName extends IGuard<typeof videoNameTypeGuard> {
  videoName: string;
}
