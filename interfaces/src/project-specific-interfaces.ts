export namespace InterfacesProjectSpecificInterfaces {
  export interface IGuard<TypeGuard> {
    _guard: TypeGuard;
  }

  export const videoNameTypeGuard: 'videoNameTypeGuard' = 'videoNameTypeGuard';

  export interface IVideoName extends IGuard<typeof videoNameTypeGuard> {
    videoName: string;
  }

  export const newVideoName = (videoName: string): IVideoName => {
    return {
      _guard: videoNameTypeGuard,
      videoName: videoName,
    };
  };

  export const videoHashNameTypeGuard: 'videoHashNameTypeGuard' =
    'videoHashNameTypeGuard';

  export interface IVideoHashName
    extends IGuard<typeof videoHashNameTypeGuard> {
    videoHashName: string;
  }

  export const newVideoHashName = (videoHashName: string): IVideoHashName => {
    return {
      _guard: videoHashNameTypeGuard,
      videoHashName,
    };
  };
}
